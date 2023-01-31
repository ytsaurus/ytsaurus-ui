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

export interface AccountUsageDataItem extends MediumInfo {
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
}

// type MediumKey = `medium:${string}`;
type MediumInfo = {
    // TODO: fix me later
    // [K in MediumKey]: number;
};
