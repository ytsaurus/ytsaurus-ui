import type {YTError} from './error';

export type LogErrorFn = (params: {message: string}, error?: Error) => void;

export type CypressNodeRaw<AttributesT extends Record<string, unknown>, ValueT> =
    | ValueT
    | CypressNode<AttributesT, ValueT>;

export type CypressNode<AttributesT extends Record<string, unknown>, ValueT> = {
    $attributes: AttributesT;
    $value: ValueT;
};

export interface BatchResultsItem<T = unknown> {
    error?: YTError;
    output?: T;
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

type OperationType =
    | 'map'
    | 'merge'
    | 'reduce'
    | 'join_reduce'
    | 'map_reduce'
    | 'sort'
    | 'erase'
    | 'remote_copy'
    | 'vanilla';

type JobState =
    | 'aborted'
    | 'aborting'
    | 'completed'
    | 'completing'
    | 'failed'
    | 'failing'
    | 'initializing'
    | 'materializing'
    | 'pending'
    | 'preparing'
    | 'reviving'
    | 'running'
    | 'starting'
    | 'suspended'
    | 'waiting';

interface RawJobEvent {
    time: string;
    state: string;
    phase?: string;
}

type JobStatistics = object | undefined;

/** Keep in sync with `packages/ui/src/ui/types/operations/job.ts`. */
interface RawJob {
    address: string;
    archive_state: string;
    finish_time?: string;
    start_time?: string;
    has_competitors: boolean;
    has_spec: boolean;
    job_competition_id: string;
    operation_id: string;
    job_id: string;
    state: JobState;
    type: OperationType;
    events: RawJobEvent[];
    exec_attributes: object;
    statistics: JobStatistics;
    monitoring_descriptor?: string;
    pool_tree?: string;
    is_stale?: boolean;
    archive_features?: {has_trace?: boolean};
    interruption_info?: {
        interruption_reason: string;
        interruption_timeout?: number;
        preempted_for?: {
            allocation_id?: string;
            operation_id?: string;
        };
        preemption_reason?: string;
    };
    error?: YTError;
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

export interface ListJobsParameters extends BaseBatchParams {
    operation_id: string;

    state?: JobState;
    type?: string;
    address?: string;
    monitoring_descriptor?: string;
    with_stderr?: boolean;
    with_monitoring_descriptor?: boolean;
    with_fail_context?: boolean;
    with_spec?: boolean;
    with_competitors?: boolean;
    with_interruption_info?: boolean;
    sort_field?: 'none' | string;
    sort_order?: 'ascending' | 'descending';
    task_name?: string;

    offset?: number;
    limit?: number;

    operation_incarnation?: string;
}

export interface GetJobParameters extends BaseBatchParams {
    operation_id: string;
    job_id: string;
}

type QueriesListRequestParams = {
    limit?: number;
    output_format?: string;
    is_tutorial?: string;
    user?: string;
    engine?: string;
    filter?: string;
    state?: string;
    tutorial_filter?: boolean;
};

export type ListQueriesParams = QueriesListRequestParams &
    BaseBatchParams & {
        stage?: string;
    };

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

export interface RegisterQueueConsumerParams extends BaseBatchParams {
    vital: boolean;
    queue_path: CypressNodeRaw<Record<string, unknown>, unknown>;
    consumer_path: CypressNodeRaw<Record<string, unknown>, unknown>;
}

export interface ListOperationsParams extends BaseBatchParams {
    pool?: string;
    pool_tree?: string;
    limit?: number;
    user?: string;
    state?: string;
}

export type UnregisterQueueConsumerParams = Omit<RegisterQueueConsumerParams, 'vital'>;

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
    | SubRequest<'list_jobs', ListJobsParameters>
    | SubRequest<'list_operations', ListOperationsParams>
    | SubRequest<'register_queue_consumer', RegisterQueueConsumerParams>
    | SubRequest<'unregister_queue_consumer', UnregisterQueueConsumerParams>
    | SubRequest<'list_queries', ListQueriesParams>
    | SubRequest<'get_job', GetJobParameters>;

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

export type ReadTableParameters = BaseBatchParams & {
    path: string;
    output_format: ReadTableOutputFormat;
    dump_error_into_response?: boolean;
    omit_inaccessible_columns?: boolean;
};

export type ReadTableOutputFormat = {
    $value: 'web_json';
    $attributes: {
        value_format?: 'yql';
        field_weight_limit?: number;
        string_weight_limit?: number;
        max_selected_column_count?: number;
        max_all_column_names_count?: number;
        column_names?: Array<string>;
    };
};
