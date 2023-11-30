import type {YTError} from '../@types/types';
import type {Settings} from './constants/settings-types';
import type {UISettings} from './ui-settings';

export interface YTConfig {
    clusters: Record<string, ClusterConfig>;
    cluster: string;
    isLocalCluster?: boolean;
    parameters: {
        interface: {
            version: string;
        };
        login: string;
        version: string;
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
}

export type CypressNode<AttributesT extends Record<string, unknown>, ValueT> = {
    $attributes: AttributesT;
    $value: ValueT;
};

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
    | 'darkgray';

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
    annotate_with_types?: boolean;
}

export interface PathParams extends BaseBatchParams {
    path: string;
}

export interface GetParams extends PathParams {
    // see more details https://nda.ya.ru/t/OkgJ1bMg6WtqEf
    attributes?: Array<string> | {keys: Array<string>; paths: Array<string>};
    fields?: Array<string>;
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
    acl: Array<{permissions: Array<YTPermissionType>; subjects: Array<string>; action: 'allow'}>;
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

export type YTPermissionType = 'read' | 'write' | 'use' | 'mount' | 'register_queue_consumer';

export interface AddMaintenanceParams extends BaseBatchParams {
    component: 'cluster_node' | 'http_proxy' | 'rpc_proxy';
    address: string;
    mine: boolean;
    comment?: string;
    type:
        | 'ban'
        | 'disable_scheduler_jobs'
        | 'disable_write_sessions'
        | 'disable_tablet_cells'
        | 'decommission';
}

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
    | SubRequest<'add_maintenance' | 'remove_maintenance', AddMaintenanceParams>;

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
      };

export interface SettingsConfig {
    data: Settings;
    meta: {
        useRemoteSettings: boolean;
        errorMessage: any;
    };
}

export interface ConfigData {
    settings: SettingsConfig;
    ytApiUseCORS?: boolean;
    uiSettings?: UISettings;
    metrikaCounterId?: number;
    allowLoginDialog?: boolean;
    allowOAuth?: boolean;
    oauthButtonLabel?: string;
    allowUserColumnPresets?: boolean;
    odinPageEnabled: boolean;
}
