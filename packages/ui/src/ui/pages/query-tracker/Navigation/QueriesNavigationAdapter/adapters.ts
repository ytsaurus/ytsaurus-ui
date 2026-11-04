import type {
    NavigationPreviewConfig,
    NavigationSchemaColumn,
    QueryResultDataType,
} from '@gravity-ui/querieskit';
import type {NavigationTable, NavigationTableSchema} from '@ytsaurus/components';

export function prepareNavigationSchema(
    schema: NavigationTableSchema[],
): (NavigationSchemaColumn & NavigationTableSchema)[] {
    return schema.map((column) => ({
        ...column,
        sortOrder:
            column.sort_order === 'ascending' || column.sort_order === 'descending'
                ? column.sort_order
                : undefined,
    }));
}

function isYqlType(type: unknown): type is QueryResultDataType {
    return Array.isArray(type) && typeof type[0] === 'string';
}

export function getNavigationCellType(
    value: unknown,
    registry: unknown[] | null,
): QueryResultDataType | undefined {
    if (!Array.isArray(value) || value.length !== 2) return undefined;
    const index = value[1];
    if (
        (typeof index !== 'number' && typeof index !== 'string') ||
        (typeof index === 'string' && !/^\d+$/.test(index)) ||
        !Number.isSafeInteger(Number(index)) ||
        Number(index) < 0
    ) {
        return undefined;
    }
    const type = registry?.[Number(index)];
    return isYqlType(type) ? type : undefined;
}

export function prepareNavigationPreview(
    table: NavigationTable | undefined,
): NavigationPreviewConfig {
    if (!table) return {columns: [], rows: []};
    const schemaOrder = new Map(table.schema.map(({name}, index) => [name, index]));
    const columnNames = [...table.columns].sort((left, right) => {
        const leftIndex = schemaOrder.get(left);
        const rightIndex = schemaOrder.get(right);
        if (leftIndex !== undefined && rightIndex !== undefined) return leftIndex - rightIndex;
        if (leftIndex !== undefined) return -1;
        if (rightIndex !== undefined) return 1;
        return 0;
    });
    return {
        columns: columnNames.map((name) => ({name, type: ['UnknownType']})),
        rows: table.rows,
    };
}
