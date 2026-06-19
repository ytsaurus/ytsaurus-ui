export interface AccountUsageDataParams {
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
}

export interface AccountUsageData {
    fields: Array<keyof AccountUsageDataItem>;
    mediums: Array<keyof AccountUsageDataItem>;

    items: Array<AccountUsageDataItem>;
    row_count: number;
}

type MediumKey = 'default' | 'cache' | string;

export type MediumKeyTemplate = `medium:${MediumKey}`;
export type VersionedKeyTemplate = `versioned:medium:${MediumKey}`;

export type AccountUsageDataItem = {
    acl_status?: 'deny' | 'allow';

    account: string;
    direct_child_count: number;
    path: string;
    type: string;
    owner: string;
    creation_time: string;
    modification_time: string;

    chunk_count: number;
    disk_space: number;
    master_memory: number;
    node_count: number;
    tablet_count: 0;
    tablet_static_memory: 0;
    'versioned:master_memory': null | number;
    'versioned:chunk_count': null | number;
    'versioned:direct_child_count': null | number;
    'versioned:disk_space': null | number;
    'versioned:node_count': null | number;
    'versioned:recursive_versioned_resource_usage': null | number;
    'versioned:tablet_count': null | number;
    'versioned:tablet_static_memory': null | number;
} & Record<`medium:${MediumKey}`, null | number> &
    Record<`versioned:medium:${MediumKey}`, null | number>;
