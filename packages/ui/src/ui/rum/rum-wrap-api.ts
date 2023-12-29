import _ from 'lodash';
import {CancelTokenSource} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {YT_API_REQUEST_ID_HEADER} from '../../shared/constants';
import {
    BatchResultsItem,
    BatchSubRequest,
    GetParams,
    OutputFormat,
    PathParams,
} from '../../shared/yt-types';
import {YTApiId} from '../../shared/constants/yt-api-id';

import {rumDebugLog2, rumGetTime, rumSendDelta} from './rum-counter';
import {RumMeasureTypes} from './rum-measure-types';
import type {ValueOf} from '../types';

export {YTApiId};

interface YTApiV3 {
    executeBatch<T = any>(
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<Array<BatchResultsItem<T>>>;
    get<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<Value>;
    list<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<Value>;
    exists(...args: ApiMethodParameters<PathParams>): Promise<boolean>;
    [method: string]: (...args: ApiMethodParameters<any>) => Promise<any>;
}

type YTApiV3WithId = {
    executeBatch<T = any>(
        id: YTApiId,
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<Array<BatchResultsItem<T>>>;
    get<Value = any>(id: YTApiId, ...args: ApiMethodParameters<GetParams>): Promise<Value>;
    list<Value = any>(id: YTApiId, ...args: ApiMethodParameters<GetParams>): Promise<Value>;
    exists(id: YTApiId, ...args: ApiMethodParameters<PathParams>): Promise<boolean>;
    alterQuery(
        id: YTApiId,
        ...args: ApiMethodParameters<{
            stage?: string;
            query_id: string;
            access_control_object?: string;
            annotations?: {
                title?: string;
            };
        }>
    ): Promise<any>;
    [method: string]: (id: YTApiId, ...args: ApiMethodParameters<any>) => Promise<any>;
};

type YTApiV4 = {
    executeBatch<T = any>(
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<{results: Array<BatchResultsItem<T>>}>;
    get<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    list<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    exists(...args: ApiMethodParameters<PathParams>): Promise<{value: boolean}>;
    [method: string]: (...args: ApiMethodParameters<any>) => Promise<any>;
};

type YTApiV4WithId = {
    executeBatch<T = any>(
        id: YTApiId,
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<{results: Array<BatchResultsItem<T>>}>;
    get<Value = any>(id: YTApiId, ...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    list<Value = any>(
        id: YTApiId,
        ...args: ApiMethodParameters<GetParams>
    ): Promise<{value: Value}>;
    exists(id: YTApiId, ...args: ApiMethodParameters<PathParams>): Promise<{value: boolean}>;
    [method: string]: (id: YTApiId, ...args: ApiMethodParameters<any>) => Promise<any>;
};

type ApiWithId<ApiT extends Record<string, (...args: ApiMethodParameters<any>) => Promise<any>>> = {
    [K in keyof ApiT]: (id: YTApiId, ...args: Parameters<ApiT[K]>) => ReturnType<ApiT[K]>;
};

interface BatchParameters {
    requests: Array<BatchSubRequest>;
    output_format?: OutputFormat;
}

type SaveCancellationCb = (cancel: CancelTokenSource) => void;

type ApiMethodParameters<PrametersT = unknown> =
    | [ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters']]
    | [ApiMethodParams<PrametersT>['parameters'], unknown];

interface ApiMethodParams<ParametersT> {
    parameters: ParametersT;
    data?: any;
    setup?: any;
    cancellation?: SaveCancellationCb;
}

function makeApiWithId<
    ApiT extends Record<string, (...args: ApiMethodParameters<any>) => Promise<any>>,
>(ytApi: ApiT): ApiWithId<ApiT> {
    return _.reduce(
        ytApi,
        (acc, _fn, k) => {
            const method = k as keyof ApiT;
            acc[method] = <T>(id: YTApiId, ...args: ApiMethodParameters<T>) => {
                const startTime = Date.now();
                return (ytApi as any)[method](...injectRequestId(id, args)).finally(() => {
                    rumDebugLog2(`fetch.${YTApiId[id]}`, Date.now() - startTime);
                });
            };
            return acc;
        },
        {} as ApiWithId<ApiT>,
    );
}

export function injectRequestId<T>(
    id: YTApiId,
    args: ApiMethodParameters<T>,
): ApiMethodParameters<T> {
    const [first, ...rest] = args;
    if (typeof first !== 'object') {
        throw new Error('unexpected behavior');
    }
    const {setup, parameters} = first || ({} as any);
    if (parameters === undefined) {
        return [{parameters: first, setup: makeSetupWithId(id, undefined)}, ...rest] as any;
    } else {
        return [{...first, setup: makeSetupWithId(id, setup)}, ...rest] as any;
    }
}

function makeSetupWithId(id: YTApiId, setup: {requestHeaders?: object} | undefined) {
    const {requestHeaders} = setup || {};
    return {...setup, requestHeaders: {...requestHeaders, [YT_API_REQUEST_ID_HEADER]: YTApiId[id]}};
}

export const ytApiV3 = yt.v3 as YTApiV3;
export const ytApiV4 = yt.v4 as YTApiV4;

export const ytApiV3Id = makeApiWithId(ytApiV3) as YTApiV3WithId;
export const ytApiV4Id = makeApiWithId(ytApiV4) as YTApiV4WithId;

export function wrapPromiseWithRum<T>(id: string, promise: Promise<T>) {
    const start = rumGetTime();

    return Promise.resolve(promise).finally(() => {
        const delta = rumGetTime() - start;
        rumSendDelta(id, delta);
    });
}

export class RumWrapper<Id extends ValueOf<typeof RumMeasureTypes>> {
    private id: Id;
    private prefix: string;
    constructor(cluster: string, id: Id) {
        this.id = id;
        this.prefix = `${cluster}.${id}`;
    }

    getMeasureId() {
        return this.id;
    }

    fetch<T>(id: YTApiId, loadPromise: Promise<T>) {
        const wrapId = this.gen('fetch', id);
        return wrapPromiseWithRum(wrapId, loadPromise);
    }

    parse<T>(id: YTApiId, parsePromise: Promise<T>) {
        const wrapId = this.gen('parse', id);
        return wrapPromiseWithRum(wrapId, parsePromise);
    }

    wrap<T>(stage: string, fn: () => T): ExcludePromise<T> {
        const start = rumGetTime();
        const res = fn();
        const delta = rumGetTime() - start;
        rumSendDelta(this.gen(`${stage}`), delta);
        return res as ExcludePromise<T>;
    }

    private gen(stage: string, id?: YTApiId) {
        if (id === undefined) {
            return this.prefix + '.' + stage;
        }
        return this.prefix + '.' + stage + '.' + YTApiId[id];
    }
}

type ExcludePromise<T> = T extends Promise<any> ? never : T;
