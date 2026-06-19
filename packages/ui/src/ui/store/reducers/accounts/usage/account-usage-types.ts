import {type PickByValue} from 'utility-types';

export type AccountUsageDataParams = {
    cluster: string;
    account: string;

    page?: {
        index?: number; // 0
        size?: number; // 20
    };

    sort_order?: Array<{field: string; desc?: boolean}>;

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

type AccountUsageBaseData = {
    account: string;
    path: string;
    type: string;
    owner: string;
    creation_time: string;
    modification_time: string;

    chunk_count: number;
    direct_child_count: number;
    disk_space: number;
    master_memory: number;
    node_count: number;
    tablet_count: number;
    tablet_static_memory: number;

    // compressed_data_size: unknown;
    // data_weight: unknown;
    // erasure_disk_space: unknown;
    // recursive_versioned_resource_usage: unknown;
    // regular_disk_space: unknown;
    // row_count: unknown;
    // uncompressed_data_size: unknown;
};

export type AccountUsageMediumKey = 'default' | 'cache' | string;

type AccountUsageMediumField = `medium:${AccountUsageMediumKey}`;

type AccountUsageMediumData = {
    [K in AccountUsageMediumField]?: null | number;
};

export type AccountUsageVersionedKey =
    | keyof PickByValue<AccountUsageBaseData, number>
    | keyof AccountUsageMediumData;

export type AccountUsageVersionedField<
    K extends AccountUsageVersionedKey = AccountUsageVersionedKey,
> = `versioned:${K}`;

type AccountUsageVersionedData = {
    [K in AccountUsageVersionedField]?: null | number;
};

export type AccountUsageDataItem = {
    acl_status?: 'deny' | 'allow';
} & AccountUsageBaseData &
    AccountUsageMediumData &
    AccountUsageVersionedData;

export type AccountUsageField = keyof AccountUsageBaseData | keyof AccountUsageMediumData;

type AccountUsageVersionedFields = {
    [K in AccountUsageVersionedKey]: AccountUsageVersionedField<K>;
};

export type AccountUsageData = {
    fields: AccountUsageField[];
    mediums: AccountUsageMediumKey[];
    versioned_fields?: AccountUsageVersionedFields;

    items: AccountUsageDataItem[];
    row_count: number;
};
