import _ from 'lodash';
import {CancelTokenSource} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {YT_API_REQUEST_ID_HEADER} from '../../shared/constants';
import {
    BatchResultsItem,
    BatchSubRequest,
    ExpectedVersion,
    GetFlowViewData,
    GetParams,
    GetPipelineStateData,
    OutputFormat,
    PathParams,
    PipelineParams,
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
    alterQuery(
        ...args: ApiMethodParameters<{
            stage?: string;
            query_id: string;
            access_control_object?: string;
            annotations?: {
                title?: string;
            };
        }>
    ): Promise<any>;
    [method: string]: (...args: ApiMethodParameters<any>) => Promise<any>;
}

type YTApiV3OmitT = Omit<YTApiV3, 'get' | 'list' | 'executeBatch'>;

type YTApiV3WithId = {
    [K in keyof YTApiV3OmitT]: {
        (id: YTApiId, ...args: Parameters<YTApiV3OmitT[K]>): ReturnType<YTApiV3OmitT[K]>;
    };
} & {
    executeBatch<T = any>(
        id: YTApiId,
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<Array<BatchResultsItem<T>>>;
    get<Value = any>(id: YTApiId, ...args: ApiMethodParameters<GetParams>): Promise<Value>;
    list<Value = any>(id: YTApiId, ...args: ApiMethodParameters<GetParams>): Promise<Value>;
};

type YTApiV4 = {
    executeBatch<T = any>(
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<{results: Array<BatchResultsItem<T>>}>;
    get<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    list<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    exists(...args: ApiMethodParameters<PathParams>): Promise<{value: boolean}>;

    getQueryTrackerInfo(...args: ApiMethodParameters<{stage?: string}>): Promise<{
        cluster_name: string;
        access_control_objects: string[];
        supported_features: {access_control: boolean};
    }>;
    switchLeader(
        ...args: ApiMethodParameters<{cell_id: string; new_leader_address: string}>
    ): Promise<any>;
    listUserTokens(
        ...args: ApiMethodParameters<{
            password_sha256: string;
            user: string;
            with_metadata: boolean;
        }>
    ): Promise<string[]>;
    revokeToken(
        ...args: ApiMethodParameters<{password_sha256: string; user: string; token_sha256: string}>
    ): Promise<unknown>;
    issueToken(
        ...args: ApiMethodParameters<{password_sha256: string; user: string; description: string}>
    ): Promise<string>;

    getPipelineSpec(...args: ApiMethodParameters<PipelineParams>): Promise<any>;
    setPipelineSpec(...args: ApiMethodParameters<PipelineParams & ExpectedVersion>): Promise<void>;
    removePipelineSpec(...args: ApiMethodParameters<PipelineParams>): Promise<void>;
    getPipelineDynamicSpec(...args: ApiMethodParameters<PipelineParams>): Promise<any>;
    setPipelineDynamicSpec(
        ...args: ApiMethodParameters<PipelineParams & ExpectedVersion>
    ): Promise<void>;
    startPipeline(...args: ApiMethodParameters<PipelineParams>): Promise<void>;
    stopPipeline(...args: ApiMethodParameters<PipelineParams>): Promise<void>;
    pausePipeline(...args: ApiMethodParameters<PipelineParams>): Promise<void>;
    getPipelineState(...args: ApiMethodParameters<PipelineParams>): Promise<GetPipelineStateData>;
    getFlowView(...args: ApiMethodParameters<PipelineParams>): Promise<GetFlowViewData>;

    [method: string]: (...args: ApiMethodParameters<any>) => Promise<any>;
};

type YTApiV4OmitT = Omit<YTApiV4, 'get' | 'list' | 'executeBatch'>;

type YTApiV4WithId = {
    [K in keyof YTApiV4OmitT]: {
        (id: YTApiId, ...args: Parameters<YTApiV4OmitT[K]>): ReturnType<YTApiV4OmitT[K]>;
    };
} & {
    executeBatch<T = any>(
        id: YTApiId,
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<{results: Array<BatchResultsItem<T>>}>;
    get<Value = any>(id: YTApiId, ...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    list<Value = any>(
        id: YTApiId,
        ...args: ApiMethodParameters<GetParams>
    ): Promise<{value: Value}>;
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
    | [ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters'], unknown];

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
