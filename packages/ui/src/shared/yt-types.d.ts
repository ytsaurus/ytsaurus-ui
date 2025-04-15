import type {YTError} from '../@types/types';

import {RawJob} from '../ytsaurus-ui.ui/types/operations/job';
import type {DescribedSettings, Stage} from './constants/settings-types';
import type {UISettings} from './ui-settings';

export type RawVersion = `${MajorMinorPatch}-${string}` | '';

export interface YTConfig {
    clusters: Record<string, ClusterConfig>;
    cluster: string;
    isLocalCluster?: boolean;
    parameters: {
        interface: {
            version: string;
        };
        login: string;
        version: RawVersion;
        authWay?: AuthWay;
    };
    environment?: 'development' | 'production' | 'farm' | 'localmode';
}

export interface ClusterUiConfig {
    enable_per_bundle_tablet_accounting?: boolean;
    enable_per_account_tablet_accounting?: boolean;
    per_bundle_accounting_help_link?: string;
    enable_maintenance_api_nodes?: boolean;
    enable_maintenance_api_proxies?: boolean;
    chyt_controller_base_url?: string;
    livy_controller_base_url?: string;
    query_tracker_default_aco?: Record<Stage, string>;
    job_trace_url_template?: {
        title: string;
        url_template: string;
        enforce_for_trees?: Array<string>;
    };
}

export type CypressNodeRaw<AttributesT extends Record<string, unknown>, ValueT> =
    | ValueT
    | CypressNode<AttributesT, ValueT>;

export type CypressNode<AttributesT extends Record<string, unknown>, ValueT> = {
    $attributes: AttributesT;
    $value: ValueT;
};

export type AnnotateWithTypes<T extends Object> = T extends undefined
    ? undefined
    : T extends Array<infer Item>
      ? Array<AnnotateWithTypes<Item>>
      : T extends Record<string, unknown>
        ? {[K in keyof T]: AnnotateWithTypes<T[K]>}
        : {$type: string; $value: unknown};

export type BatchResults<T extends Array<any>> = [...BatchFirst<T>, ...BatchRest<T>];

export type BatchFirst<T extends Array<any>> = T extends [first: infer F, ...rest: any]
    ? [BatchResultsItem<F>]
    : [];
export type BatchRest<T extends Array<any>> = T extends [first: any, ...rest: infer R]
    ? BatchResults<R>
    : [];

export interface BatchResultsItem<T = unknown> {
    error?: YTError;
    output?: T;
}

export type ClusterTheme =
    | 'grapefruit'
    | 'bittersweet'
    | 'sunflower'
    | 'grass'
    | 'mint'
    | 'aqua'
    | 'bluejeans'
    | 'lavander'
    | 'pinkrose'
    | 'lightgray'
    | 'mediumgray'
    | 'darkgray'
    | 'dornyellow'
    | 'rubber';

export interface ClusterConfig {
    id: string;
    name: string;
    theme: ClusterTheme;
    environment: 'development' | 'production' | 'prestable' | 'testing' | 'localmode';
    group?: string;
    primaryMaster?: {
        cellTag: number;
    };
    infra?: {
        preset: string;
        serviceId: number;
        environmentId: number;
        dataCenters?: Array<string>;
    };
    proxy: string;
    /**
     * if defined it will be used instead of `proxy`-field for some direct
     * heavy url/commands like: read_table, write_table, get-job-stderr, ...
     * the field should be used only from browser.
     */
    externalProxy?: string;

    hwOrder?: unknown;

    authentication?: 'none' | 'basic' | 'domain';
    secure?: boolean;
    description?: string;

    isLocalCluster?: boolean;

    urls?: {
        icon: string;
        icon2x: string;
        iconbig?: string;
    };

    /**
     * Allows to override default title and text on login page, accepts HTML string.
     */
    loginPageSettings?: {
        title?: string;
        text?: string;
    };

    operationPageSettings?: {
        disableOptimizationForYTFRONT2838: boolean;
    };

    uiSettings?: Partial<Pick<UISettings, 'uploadTableExcelBaseUrl' | 'exportTableBaseurl'>>;
}

export interface SubRequest<K extends string, T extends BaseBatchParams> {
    command: K;
    parameters: T;
    setup?: unknown;
}

export type SetSubRequest<K extends string, T extends BaseBatchParams, V> = SubRequest<K, T> & {
    input: V;
};

export interface BaseBatchParams {
    transaction_id?: string;
    ui_marker?: string;
    read_from?: 'cache';
    disable_per_user_cache?: boolean;
    suppress_transaction_coordinator_sync?: boolean;
    suppress_upstream_sync?: boolean;
}

export interface PathParams extends BaseBatchParams {
    path: string;
    output_format?:
        | 'json'
        | {
              $value: 'json';
              $attributes: {
                  encode_utf8?: 'true' | 'false';
                  annotate_with_types?: boolean;
                  stringify?: boolean;
              };
          };
}

export interface GetParams extends PathParams {
    // see more details https://nda.ya.ru/t/OkgJ1bMg6WtqEf
    attributes?: Array<string> | {keys: Array<string>; paths: Array<string>};
    fields?: Array<string>;
    max_size?: number;
}

export interface ExecuteBatchParams extends BaseBatchParams {
    requests: Array<BatchSubRequest>;
}

export interface CopyMoveParams extends BaseBatchParams {
    source_path: string;
    destination_path: string;
    preserve_account?: boolean;
}

export interface MergeParams extends BaseBatchParams {
    spec: {
        input_table_paths: Array<string>;
        output_table_path: string;
        force_transform?: boolean;
        sorted?: {mode: 'sorted'};
    };
}

export interface CheckPermissionsParams extends BaseBatchParams {
    user: string;
    path: string;
    permission: YTPermissionType;
    vital?: boolean;
}

export interface TransferPoolQuotaParams extends BaseBatchParams {
    source_pool: string;
    destination_pool: string;
    pool_tree: string;
    resource_delta: unknown;
}

export interface CheckAclParams extends BaseBatchParams {
    acl: Array<{
        permissions: Array<YTPermissionType>;
        subjects: Array<string>;
        action: 'allow';
    }>;
    user: string;
    permission: YTPermissionType;
}

export interface GetQueryParams extends BaseBatchParams {
    query_id: string;
    stage?: string;
}

export interface GetQueryResultParams extends GetQueryParams {
    result_index: number;
}

export type YTPermissionType =
    | 'administer'
    | 'create'
    | 'read'
    | 'write'
    | 'use'
    | 'manage'
    | 'modify_children'
    | 'mount'
    | 'remove'
    | 'register_queue_consumer';

export interface AddMaintenanceParams extends BaseBatchParams {
    component: 'cluster_node' | 'http_proxy' | 'rpc_proxy';
    address: string;
    comment?: string;
    type:
        | 'ban'
        | 'disable_scheduler_jobs'
        | 'disable_write_sessions'
        | 'disable_tablet_cells'
        | 'decommission';
}

export interface RemoveMaintenanceParams extends AddMaintenanceParams {
    mine: boolean;
}

export interface AddMembersParams extends BaseBatchParams {
    group: string;
    member: string;
}

export interface RemoveMembersParams extends BaseBatchParams {
    group: string;
    member: string;
}

export interface ListJobsParameters {
    operation_id: string;

    state?: JobState;
    type?: string;
    address?: string;
    with_stderr?: boolean;
    with_monitoring_descriptor?: boolean;
    with_fail_context?: boolean;
    with_spec?: boolean;
    with_competitors?: boolean;
    sort_field?: 'none' | string;
    sort_order?: 'ascending' | 'descending';
    task_name?: string;

    offset?: number;
    limit?: number;

    operation_incarnation?: string;
}

export interface ListJobsResponse {
    archive_job_count: number;
    continuation_token: string;
    controller_agent_job_count: number;
    cypress_job_count: number;
    errors: Array<YTError>;
    type_coutns: Record<string, number | undefined>;
    state_counts: Record<string, number | undefined>;

    jobs: Array<ListJobsItem>;
}

type InheritedFromRawJob = Pick<
    RawJob,
    | 'address'
    | 'archive_state'
    | 'finish_time'
    | 'is_stale'
    | 'job_competition_id'
    | 'has_competitors'
    | 'has_spec'
    | 'start_time'
    | 'state'
    | 'type'
    | 'pool_tree'
>;

type MissingKeysFromRawJob = Exclude<keyof RawJob, keyof InheritedFromRawJob>;
type MissingFromRawJob = Partial<Record<MissingKeysFromRawJob, undefined>>;

type JobCompetitionId = ListJobsItem['job_competition_id'];

export type ListJobsItem = InheritedFromRawJob &
    MissingFromRawJob & {
        controller_state: string;
        id: string;
        job_cookie: number;
        probing_job_competition_id: string;
        progress: number;
        task_name: string;
        fail_context_size?: number;
        stderr_size?: number;
        input_paths?: Array<unknown>;
        brief_statistics: CypressNode<
            {timestamp: string},
            Record<
                | 'job_proxy_cpu_usage'
                | 'output_pipe_idle_time'
                | 'processed_input_compressed_data_size'
                | 'processed_input_data_weight'
                | 'processed_input_row_count'
                | 'processed_input_uncompressed_data_size'
                | 'processed_output_compressed_data_size'
                | 'processed_output_uncompressed_data_size',
                number | undefined
            >
        >;
        operation_incarnation?: string;
    };

export type OperationType =
    | 'map'
    | 'merge'
    | 'reduce'
    | 'join_reduce'
    | 'map_reduce'
    | 'sort'
    | 'erase'
    | 'remote_copy'
    | 'vanilla';

export type BatchSubRequest =
    | SubRequest<'transfer_pool_resources', TransferPoolQuotaParams>
    | SubRequest<'mount_table' | 'unmount_table' | 'freeze_table' | 'unfreeze_table', PathParams>
    | SubRequest<'check_permission', CheckPermissionsParams>
    | SetSubRequest<'set', PathParams, any>
    | SubRequest<'remove', PathParams>
    | SubRequest<'get' | 'list', GetParams>
    | SubRequest<'exists', PathParams>
    | SubRequest<'copy' | 'move', CopyMoveParams>
    | SubRequest<'merge', MergeParams>
    | SubRequest<'execute_batch', ExecuteBatchParams>
    | SubRequest<'check_permission_by_acl', CheckAclParams>
    | SubRequest<'get_query', GetQueryParams>
    | SubRequest<'get_query_result', GetQueryResultParams>
    | SubRequest<'add_maintenance', AddMaintenanceParams>
    | SubRequest<'remove_maintenance', RemoveMaintenanceParams>
    | SubRequest<'add_member', AddMembersParams>
    | SubRequest<'remove_member', RemoveMembersParams>
    | SubRequest<'list_jobs', ListJobsParameters>;

export type OutputFormat =
    | {
          $value: 'json';
          $attributes: {
              encode_utf8?: 'true' | 'false';
          };
      }
    | {
          $value: 'web_json';
          $attributes: {
              field_weight_limit?: number;
          };
      }
    | {
          $value: 'json';
          $attributes: {
              stringify: boolean;
              annotate_with_types: boolean;
          };
      }
    | 'json';

export interface SettingsConfig {
    data: Partial<DescribedSettings>;
    meta: {
        useRemoteSettings: boolean;
        errorMessage: any;
    };
}

export interface ConfigData {
    userSettingsCluster?: string;
    settings: SettingsConfig;
    ytApiUseCORS?: boolean;
    uiSettings?: UISettings;
    metrikaCounterId?: number;
    allowPasswordAuth?: boolean;
    allowOAuth?: boolean;
    oauthButtonLabel?: string;
    allowUserColumnPresets?: boolean;
    odinPageEnabled: boolean;
    allowTabletErrorsAPI: boolean;
}

export type PipelineParams = {
    pipeline_path: string;
};

export type TableParams = {
    path: string;
};

export type ExpectedVersion = {
    expected_version?: string | number;
};

export type GetPipelineStateData =
    | 'Unknown'
    | 'Stopped'
    | 'Paused'
    | 'Working'
    | 'Draining'
    | 'Pausing'
    | 'Completed';

export type GetFlowViewData = {
    execution_spec: {
        layout: {
            value: {
                jobs: Record<FlowViewJobId, FlowViewJobInfo>;
                partitions: Record<FlowViewPartitionId, FlwoViewPartitionInfo>;
            };
        };
    };
    workers: Record<FlowViewWorkerId, FlowViewWorkerInfo>;
};

type FlowViewJobId = string;
type FlowViewPartitionId = string;
type FlowViewWorkerId = string;

export type FlwoViewPartitionInfo = {
    computation_id: FlowViewPartitionId;
    lower_key: Array<unkonwn>;
    upper_key: Arary<unknown>;
    parameters: unknown;
    partition_id: string;
    state: 'executing';
    state_epoch: number;
    state_timestamp: string;
    current_job_id?: FlowViewJobId;
};

export type FlowViewJobInfo = {
    job_id: FlowViewJobId;
    lease_id: string;
    partition_id: FlowViewPartitionId;
    worker_address: string;
    worker_incarnation_id: string;
};

export type FlowViewWorkerInfo = {
    address: FlowViewWorkerId;
};

export type GetQueryTrackerInfoResponse = {
    cluster_name: string;
    access_control_objects: string[];
    query_tracker_stage: string;
    supported_features: {access_control: boolean; multiple_aco?: boolean};
    clusters?: Array<string>;
};
