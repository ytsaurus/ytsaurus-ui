export type AccountUsageMediumKey =
    | 'cache'
    | 'cloud'
    | 'default'
    | 'nvme_blobs'
    | 'pigeons'
    | 'samovar_journals'
    | 'ssd_blobs'
    | 'ssd_intermediate'
    | 'ssd_journals'
    | 'ssd_slots_physical'
    | 'ssd_test';

type AccountUsageVersionedKey =
    | 'chunk_count'
    | 'compressed_data_size'
    | 'data_weight'
    | 'direct_child_count'
    | 'disk_space'
    | 'erasure_disk_space'
    | 'node_count'
    | 'regular_disk_space'
    | 'row_count'
    | 'tablet_count'
    | 'tablet_static_memory'
    | 'uncompressed_data_size'
    | `medium:${AccountUsageMediumKey}`;

type AccountUsageMediumField = `medium:${AccountUsageMediumKey}`;

export type AccountUsageField =
    | 'access_time'
    | 'account'
    | 'approximate_row_count'
    | 'chunk_count'
    | 'chunk_host_cell_master_memory'
    | 'compressed_data_size'
    | 'creation_time'
    | 'data_weight'
    | 'depth'
    | 'direct_child_count'
    | 'disk_space'
    | 'dynamic'
    | 'erasure_disk_space'
    | 'master_memory'
    | 'modification_time'
    | 'node_count'
    | 'owner'
    | 'path'
    | 'path_patched'
    | 'primary_medium'
    | 'regular_disk_space'
    | 'resource_usage'
    | 'row_count'
    | 'tablet_count'
    | 'tablet_static_memory'
    | 'type'
    | 'uncompressed_data_size'
    | 'versioned_resource_usage'
    | AccountUsageMediumField;

export type AccountUsageVersionedField<
    K extends AccountUsageVersionedKey = AccountUsageVersionedKey,
> = `versioned:${K}`;

type AccountUsageBaseData = {
    acl_status?: 'deny' | 'allow';

    account: string;
    path: string;
    type: string;
    owner: string | null;
    creation_time: string | null;
    modification_time: string | null;
    access_time: string | null;

    depth: number;
    dynamic: boolean | null;
    path_patched: string | null;
    primary_medium: string | null;
    approximate_row_count: number | null;

    chunk_count: number;
    chunk_host_cell_master_memory: number;
    direct_child_count: number;
    disk_space: number;
    master_memory: number;
    node_count: number;
    tablet_count: number;
    tablet_static_memory: number;

    compressed_data_size: number | null;
    data_weight: number | null;
    erasure_disk_space: number | null;
    regular_disk_space: number | null;
    row_count: number | null;
    uncompressed_data_size: number | null;

    resource_usage: unknown;
    versioned_resource_usage: unknown;
};

type AccountUsageMediumData = {
    [K in AccountUsageMediumField]?: number | null;
};

type AccountUsageVersionedData = {
    [K in AccountUsageVersionedKey as AccountUsageVersionedField<K>]?: number | null;
};

export type AccountUsageDataItem = AccountUsageBaseData &
    AccountUsageMediumData &
    AccountUsageVersionedData;

type AccountUsageVersionedFields = {
    [K in AccountUsageVersionedKey]: AccountUsageVersionedField<K>;
};

export type AccountUsageDataParams = {
    cluster: string;
    account: string;

    page?: {
        index?: number; // 0
        size?: number; // 20
    };

    sort_order?: Array<{
        field: string;
        desc?: boolean;
    }>;

    row_filter?: {
        owner?: string;
        base_path?: string; // only for tree
        exclude_map_nodes?: boolean; // by default true
        path_regexp?: string;
        field_filters?: Array<{
            field: string;
            value: number;
            comparison: '<' | '>' | '==' | '<=' | '>=';
        }>;
    };
};

export type AccountUsageData = {
    fields: AccountUsageField[];
    mediums: AccountUsageMediumKey[];
    versioned_fields?: AccountUsageVersionedFields;
    items: AccountUsageDataItem[];
    row_count: number;
};
