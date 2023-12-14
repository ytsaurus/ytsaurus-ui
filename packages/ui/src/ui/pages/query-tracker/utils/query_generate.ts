import {QueryEngine} from '../module/engines';

const INDENT = '    ';

function prepareColumns(columns: string[], config: {maxSize?: number; delimiter?: string} = {}) {
    const {maxSize = 30, delimiter = '`'} = config;
    if (!columns?.length || columns.length > maxSize) {
        return '*';
    }
    return columns.map((colums) => `${delimiter}${colums}${delimiter}`).join(`, `);
}

export type GenerateTableQueryParams = {
    path: string;
    columns: string[];
    pageSize: number;
    schemaExists: boolean;
    dynamic: boolean;
    maxColumnsLength?: number;
};
export function generateYQLQuery(tableParams: GenerateTableQueryParams, cluster: string): string {
    const {columns, pageSize = 1, schemaExists, path, maxColumnsLength} = tableParams;
    const pragma = schemaExists
        ? ''
        : `-- Please note that table schema not specified, so we're telling YQL to infer it from data.
PRAGMA yt.InferSchema = '1';\n`;
    const yqlCluster = cluster.replace(/-/g, '').toLowerCase();
    const columnsToQuery = prepareColumns(columns, {maxSize: maxColumnsLength});
    return `${pragma}USE ${yqlCluster};\n\nSELECT\n${INDENT}${columnsToQuery}\nFROM \`${path}\`\nLIMIT ${pageSize};\n`;
}

export function generateCHYTQuery(tableParams: GenerateTableQueryParams): string {
    const {columns, pageSize = 1, path, maxColumnsLength} = tableParams;
    const columnsToQuery = prepareColumns(columns, {maxSize: maxColumnsLength});
    return `SELECT\n${INDENT}${columnsToQuery}\nFROM \`${path}\`\nLIMIT ${pageSize};\n`;
}

export function generateYTQLQuery(tableParams: GenerateTableQueryParams): string {
    const {columns, pageSize = 1, path, maxColumnsLength} = tableParams;
    const columnsToQuery = prepareColumns(columns, {maxSize: maxColumnsLength});
    return `${columnsToQuery}\nFROM [${path}]\nLIMIT ${pageSize}\n`;
}

export function generateSPYTQuery(tableParams: GenerateTableQueryParams): string {
    const {columns, pageSize = 1, path, dynamic, maxColumnsLength} = tableParams;
    const columnsToQuery = prepareColumns(columns, {maxSize: maxColumnsLength});
    const pathModifiers = dynamic ? '/@latest_version' : '';
    return `SELECT\n${INDENT}${columnsToQuery}\nFROM yt.\`ytTable:/${path}${pathModifiers}\`\nLIMIT ${pageSize};\n`;
}

export function generateQuerySettings(
    engine: QueryEngine,
    cluster: string,
): Record<string, string> | undefined {
    switch (engine) {
        case QueryEngine.CHYT:
        case QueryEngine.YT_QL:
        case QueryEngine.SPYT:
            return {
                cluster,
            };
    }
    return {};
}

export function generateQueryText(
    cluster: string,
    engine: QueryEngine,
    tableParams: GenerateTableQueryParams,
) {
    switch (engine) {
        case QueryEngine.YQL:
            return generateYQLQuery(tableParams, cluster);
        case QueryEngine.CHYT:
            return generateCHYTQuery(tableParams);
        case QueryEngine.YT_QL:
            return generateYTQLQuery(tableParams);
        case QueryEngine.SPYT:
            return generateSPYTQuery(tableParams);
    }
    return '';
}
