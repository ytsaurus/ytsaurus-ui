import reduce_ from 'lodash/reduce';
import {type AxiosProgressEvent, type CancelTokenSource} from 'axios';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {YT_API_REQUEST_ID_HEADER} from '../../shared/constants';
import {
    type AlterReplicationCardParams,
    type BatchResultsItem,
    type BatchSubRequest,
    type CheckPermissionParams,
    type CheckPermissionResponse,
    type ExpectedVersion,
    type FlowExecuteCommand,
    type FlowExecuteTypes,
    type GetFlowViewData,
    type GetJobParameters,
    type GetParams,
    type GetPipelineStateData,
    /* GetQueryTrackerInfoResponse, */
    type ListJobsParameters,
    type ListJobsResponse,
    type ListOperationEventsParameters,
    type ListOperationEventsResponse,
    type OperationIdParams,
    type OutputFormat,
    type PathParams,
    type PipelineParams,
    type ReadTableParameters,
    type SelectRowsParams,
    type SupportedFeatures,
    type TableParams,
} from '../../shared/yt-types';
import {YTApiId, type YTApiIdType} from '../../shared/constants/yt-api-id';

import {rumDebugLog2, rumGetTime, rumSendDelta} from './rum-counter';
import {type RumMeasureTypes} from './rum-measure-types';
import {type FIX_MY_TYPE, type ValueOf} from '../types';

export {YTApiId};

type CreateParams = {
    path?: string;
    type: string;
    recursive?: boolean;
    ignore_existing?: boolean;
    attributes?: Record<string, unknown>;
};

type StartTransactionParams = {timeout?: number};

type WriteFileParams = {
    path: string;
    compute_md5?: boolean;
    ping_ancestor_transactions?: boolean;
    transaction_id?: string;
};

type TransactionIdParams = {transaction_id: string};

type GetJobInputPathsParameters = {
    job_id: string;
    output_format?: OutputFormat;
};

type GetOperationParams = {
    operation_id?: string;
    operation_alias?: string;
    include_runtime?: boolean;
    includeScheduler?: boolean;
    attributes?: string[];
    output_format?: OutputFormat;
};

interface YTApiV3 {
    executeBatch<T = any>(
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<Array<BatchResultsItem<T>>>;
    set(...args: ApiMethodParameters<PathParams>): Promise<void>;
    get<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<Value>;
    list<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<Value>;
    remove(...args: ApiMethodParameters<PathParams>): Promise<void>;
    exists(...args: ApiMethodParameters<PathParams>): Promise<boolean>;
    create(...args: ApiMethodParameters<CreateParams>): Promise<void>;
    startTransaction(...args: ApiMethodParameters<StartTransactionParams>): Promise<string>;
    writeFile(...args: ApiMethodParameters<WriteFileParams>): Promise<void>;
    commitTransaction(...args: ApiMethodParameters<TransactionIdParams>): Promise<void>;
    abortTransaction(...args: ApiMethodParameters<TransactionIdParams>): Promise<void>;
    getOperation<Value = any>(...args: ApiMethodParameters<GetOperationParams>): Promise<Value>;
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
    listJobs(...args: ApiMethodParameters<ListJobsParameters>): Promise<ListJobsResponse>;
    readTable(...args: ApiMethodParameters<ReadTableParameters>): Promise<unknown>;
    selectRows<Value = any>(...args: ApiMethodParameters<SelectRowsParams>): Promise<Value>;
    abortOperation(...args: ApiMethodParameters<OperationIdParams>): Promise<void>;
    completeOperation(...args: ApiMethodParameters<OperationIdParams>): Promise<void>;
    resumeOperation(...args: ApiMethodParameters<OperationIdParams>): Promise<void>;
    suspendOperation(...args: ApiMethodParameters<OperationIdParams>): Promise<void>;
    checkPermission(
        ...args: ApiMethodParameters<CheckPermissionParams>
    ): Promise<CheckPermissionResponse>;
    alterTableReplica(
        ...args: ApiMethodParameters<{
            replica_id: string;
            mode?: string;
            enabled?: boolean;
            enable_replicated_table_tracker?: boolean;
        }>
    ): Promise<void>;
    getSupportedFeatures(...args: ApiMethodParameters<{}>): Promise<{features: SupportedFeatures}>;
    getJob<Value = any>(...args: ApiMethodParameters<GetJobParameters>): Promise<Value>;
    getJobInputPaths<Value = any>(
        ...args: ApiMethodParameters<GetJobInputPathsParameters>
    ): Promise<Value>;
}

type YTApiV3OmitT = Omit<YTApiV3, 'get' | 'list' | 'executeBatch' | 'selectRows'>;

type YTApiV3WithId = {
    [K in keyof YTApiV3OmitT]: {
        (id: YTApiIdType, ...args: Parameters<YTApiV3OmitT[K]>): ReturnType<YTApiV3OmitT[K]>;
    };
} & {
    executeBatch<T = any>(
        id: YTApiIdType,
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<Array<BatchResultsItem<T>>>;
    get<Value = any>(id: YTApiIdType, ...args: ApiMethodParameters<GetParams>): Promise<Value>;
    list<Value = any>(id: YTApiIdType, ...args: ApiMethodParameters<GetParams>): Promise<Value>;
    selectRows<Value = any>(
        id: YTApiIdType,
        ...args: ApiMethodParameters<SelectRowsParams>
    ): Promise<Value>;
};

type YTApiV4 = {
    executeBatch<T = any>(
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<{results: Array<BatchResultsItem<T>>}>;
    get<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    list<Value = any>(...args: ApiMethodParameters<GetParams>): Promise<{value: Value}>;
    exists(...args: ApiMethodParameters<PathParams>): Promise<{value: boolean}>;
    startQuery(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    listQueries(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    getQuery(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    abortQuery(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    readQueryResults(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    getQueryResults(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    alterQuery(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;
    getQueryTrackerInfo(
        ...args: ApiMethodParameters<{stage?: string}>
    ): Promise<FIX_MY_TYPE /* GetQueryTrackerInfoResponse */>;

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
    setPipelineSpec(
        ...args: ApiMethodParameters<PipelineParams & {force?: boolean} & ExpectedVersion>
    ): Promise<void>;
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
    listJobs(...args: ApiMethodParameters<ListJobsParameters>): Promise<ListJobsResponse>;
    flowExecute<Command extends FlowExecuteCommand>(
        ...args: ApiMethodParameters<FlowExecuteTypes[Command]['ParamsType']>
    ): Promise<FlowExecuteTypes[Command]['ResponseType']>;

    remountTable(...args: ApiMethodParameters<TableParams>): Promise<void>;

    listOperationEvents(
        ...args: ApiMethodParameters<ListOperationEventsParameters>
    ): Promise<ListOperationEventsResponse>;

    getTabletErrors(...args: ApiMethodParameters<FIX_MY_TYPE>): Promise<FIX_MY_TYPE>;

    alterReplicationCard(
        ...args: ApiMethodParameters<AlterReplicationCardParams>
    ): Promise<unknown>;
};

type YTApiV4OmitT = Omit<YTApiV4, 'get' | 'list' | 'executeBatch'>;

type YTApiV4WithId = {
    [K in keyof YTApiV4OmitT]: {
        (id: YTApiIdType, ...args: Parameters<YTApiV4OmitT[K]>): ReturnType<YTApiV4OmitT[K]>;
    };
} & {
    executeBatch<T = any>(
        id: YTApiIdType,
        ...args: ApiMethodParameters<BatchParameters>
    ): Promise<{results: Array<BatchResultsItem<T>>}>;
    get<Value = any>(
        id: YTApiIdType,
        ...args: ApiMethodParameters<GetParams>
    ): Promise<{value: Value}>;
    list<Value = any>(
        id: YTApiIdType,
        ...args: ApiMethodParameters<GetParams>
    ): Promise<{value: Value}>;
};

type ApiWithId<ApiT extends Record<string, (...args: ApiMethodParameters<any>) => Promise<any>>> = {
    [K in keyof ApiT]: (id: YTApiIdType, ...args: Parameters<ApiT[K]>) => ReturnType<ApiT[K]>;
};

export interface BatchParameters {
    requests: Array<BatchSubRequest>;
    output_format?: OutputFormat;
}

export type SaveCancellationCb = (cancel: CancelTokenSource) => void;

export type DataType = unknown;
export type CancellationType = SaveCancellationCb;

export type ApiMethodParameters<PrametersT = unknown> =
    | [ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters']]
    | [
          ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters'],
          DataType | CancellationType,
      ]
    | [
          ApiMethodParams<PrametersT> | ApiMethodParams<PrametersT>['parameters'],
          DataType,
          CancellationType,
      ];

export type YTApiSetup = {
    proxy?: string;
    requestHeaders?: Record<string, string>;
    transformResponse?: (d: {parsedData: any; rawResponse: any}) => any;
    transformError?: (d: {parsedData: any; rawError: any}) => any;
    onUploadProgress?: (e: AxiosProgressEvent) => void;
    JSONSerializer?: {
        parse: (data: string) => any;
        stringify: (data: any) => string;
    };
};

export interface ApiMethodParams<ParametersT> {
    parameters: ParametersT;
    data?: any;
    setup?: YTApiSetup;
    cancellation?: SaveCancellationCb;
}

function makeApiWithId<
    K extends keyof ApiT,
    ApiT extends Record<K, (...args: ApiMethodParameters<any>) => Promise<any>>,
>(ytApi: ApiT): ApiWithId<ApiT> {
    return reduce_(
        ytApi,
        (acc, _fn, k) => {
            const method = k as keyof ApiT;
            acc[method] = <T>(id: YTApiIdType, ...args: ApiMethodParameters<T>) => {
                const startTime = Date.now();
                return (ytApi as any)[method](...injectRequestId(id, args)).finally(() => {
                    rumDebugLog2(`fetch.${id}`, Date.now() - startTime);
                });
            };
            return acc;
        },
        {} as ApiWithId<ApiT>,
    );
}

export function injectRequestId<T>(
    id: YTApiIdType,
    args: ApiMethodParameters<T>,
): ApiMethodParameters<T> {
    const [first, dataOrCancellation, cancellationCandidate] = args;
    if (typeof first !== 'object') {
        throw new Error('unexpected behavior');
    }
    const data = typeof dataOrCancellation === 'function' ? undefined : dataOrCancellation;
    const cancellation =
        typeof dataOrCancellation === 'function' ? dataOrCancellation : cancellationCandidate;

    const {setup, parameters} = first || ({} as any);
    if (parameters === undefined) {
        return [
            {parameters: first, setup: makeSetupWithId(id, undefined), data, cancellation},
        ] as any;
    } else {
        return [{data, cancellation, ...first, setup: makeSetupWithId(id, setup)}] as any;
    }
}

function makeSetupWithId(id: YTApiIdType, setup: YTApiSetup | undefined) {
    const {requestHeaders} = setup || {};
    return {...setup, requestHeaders: {...requestHeaders, [YT_API_REQUEST_ID_HEADER]: id}};
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

    fetch<T>(id: YTApiIdType, loadPromise: Promise<T>) {
        const wrapId = this.gen('fetch', id);
        return wrapPromiseWithRum(wrapId, loadPromise);
    }

    parse<T>(id: YTApiIdType, parsePromise: Promise<T>) {
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

    private gen(stage: string, id?: YTApiIdType) {
        if (id === undefined) {
            return this.prefix + '.' + stage;
        }
        return this.prefix + '.' + stage + '.' + id;
    }
}

type ExcludePromise<T> = T extends Promise<any> ? never : T;
