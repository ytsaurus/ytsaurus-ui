import type {ReactNode} from 'react';

export type ValueOf<T> = T[keyof T];

export interface YsonSettings {
    format: string;
    showDecoded: boolean;
    compact: boolean;
    escapeWhitespace: boolean;
    binaryAsHex: boolean;
    asHTML: boolean;
}

export type NavigationTableSchema = {
    name: string;
    required: boolean;
    sort_order?: string;
    type: string;
};

export type NavigationTableMeta = {
    key: string;
    value: ReactNode;
    visible?: boolean;
};

/** Table data loaded by path (schema, rows, meta, etc.) */
export type NavigationTableData = {
    name: string;
    rows: unknown[];
    columns: string[];
    schema: NavigationTableSchema[];
    meta: NavigationTableMeta[][];
    yqlTypes: unknown[] | null;
};

/** Adapter for loading table data by path. Host app implements this. */
export type NavigationTableDataAdapter = {
    loadTable: (path: string) => Promise<NavigationTableData | null>;
};

/** Result of applying filter to table (e.g. filtered schema). */
export type NavigationTableWithFilter = NavigationTableData & {
    schema: NavigationTableSchema[];
};

export const CypressNodeTypes = {
    REPLICATED_TABLE: 'replicated_table',
    REPLICATION_LOG_TABLE: 'replication_log_table',
    CHAOS_REPLICATED_TABLE: 'chaos_replicated_table',
    MAP_NODE: 'map_node',
    TABLE: 'table',
};
