import _ from 'lodash';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {rumDebugLog2, rumGetTime, rumSendDelta} from './rum-counter';
import {CancelTokenSource} from 'axios';
import {YT_API_REQUEST_ID_HEADER} from '../../shared/constants';
import {RumMeasureTypes} from './rum-measure-types';
import {
    BatchResultsItem,
    BatchSubRequest,
    GetParams,
    OutputFormat,
    PathParams,
} from '../../shared/yt-types';
import type {ValueOf} from '../types';

export enum YTApiId {
    // Names of ids for node-controllers should be started with 'ui_'-prefix
    ui_clusterInfo,
    ui_loadColumnPreset,

    // Some ids without specific page
    clusterParams,
    clusterParamsIsDeveloper,

    checkPermissions,
    getPoolTree,
    getPoolTrees,
    getPoolDefaultPoolTreeName,
    getPoolTreesPath,
    listPoolNames,
    getUsableBundles,
    listAccounts,
    listBundles,
    listGroups,
    listUsableAccounts,
    listUsers,
    listUsersUM,
    openAttributesModal,
    pathEditorLoadSuggestions,
    updateAttributes,
    updateNodeAttributes,

    // Page-specific requests
    accountsData,
    accountsEditData,

    attributesEditorGetAttrs,
    attributesEditorMerge,
    attributesEditorSet,

    componentsClusterNodes,
    componentGetRpcProxies,
    componentsRpcProxies,
    componentsShards,
    componentsUpdateNodeData,

    groupsData,
    groupsEditData,
    groupsListAll,

    // dynamic tables
    dynTableCheckPerm,
    dynTableSelectRows,
    dynTableSelectRowsPreload,

    // static tables
    tableReadPreload,
    tableRead,

    navigationAttributes,
    navigationCheckPermissions,
    navigationCopy,
    navigationDelete,
    navigationDynTableState,
    navigationGetAnnotation,
    navigationGetDocument,
    navigationGetPath,
    navigationGetPathInfo,
    navigationGetTabletState,
    navigationIsStaticTable,
    navigationListNodes,
    navigationListTransactions,
    navigationLocks,
    navigationTransactions,
    navigationMove,
    navigationMoveToTrash,
    navigationMoveToTrashRestorePath,
    navigationResourceUsage,
    navigationRestorePath,
    navigationRTReplicas,
    navigationTableSortLoadColumns,
    navigationTabletErrors,
    navigationTabletErrorsCountDynTable,
    navigationTabletErrorsCountReplicatedTable,
    navigationTableMountConfig,
    navigationTypeDynamic,
    navigationUpdateView,
    navigationUserAttributeKeys,

    nodeAttributes,
    nodeMemoryUsage,
    nodeUnrecognizedOptions,

    schedulingData,
    schedulingEditPool,

    listOperations,

    operationGetJobs,
    operationIntermediateResourceUsage,
    operationIsEphemeral,
    operationsSchedulerInstances,
    listJobs100,

    resourcePlannerPoolDetails,

    schedulingGetAttrsBeforeEdit,
    schedulingLoadOperations,
    schedulingLoadOperationsPerPool,
    schedulingLoadTree,
    schedulingTransferPoolQuota,
    schedulingPoolFullPath,

    systemCAInstances,
    systemCAStates,
    systemChunks,
    systemMasters,
    systemMastersConfig,
    systemMastersConfigDiscoveryServer,
    systemNodes,
    systemProxies,
    systemResources,
    systemRpcProxies,
    systemSchedulers,
    systemSchedulersState,

    tabletAttribute,
    tabletCellAttributes,
    tabletPartitions,
    tabletStores,
    tabletStoresByIds,
    tabletTableAttributes,

    tabletCellBundles,
    tabletCellBundlesEditData,
    tabletCellBundlesInstancesDetails,
    tabletCellBundlesSetAttrs,
    tabletCellBundlesWithAbc,

    chaosCellBundles,
    chaosCellBundlesEditData,
    chaosCellBundlesSetAttrs,

    usersData,
    usersEditData,
    usersSaveData,

    queueStatus,
    queuePartitions,
    queueConsumerStatus,
    queueConsumerPartitions,

    bundleControllerZones,
    tabletBundleControllerState,
    tabletBundlesCheckWrite,
    listQueries,
    getQuery,
    startQuery,
    abortQuery,
    readQueryResults,
    getQueryResults,
    alterQuery,

    addMaintenance,
    removeMaintenance,
    maintenanceRequests,
}

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
