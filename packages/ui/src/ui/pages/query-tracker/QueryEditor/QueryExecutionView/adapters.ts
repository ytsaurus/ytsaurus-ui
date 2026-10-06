import type {
    ErrorTreeItem,
    QueryResultColumn,
    QueryResultsView,
    QueryStatisticsItem,
} from '@gravity-ui/querieskit';
import {type Type, parseV3Type} from '@ytsaurus/components';

import type {QueryError} from '../../../../types/query-tracker/api';
import type {QueryResultReadyState} from '../../../../types/query-tracker/queryResult';

export function prepareError(error: QueryError, id = 'error'): ErrorTreeItem {
    const severity = error.attributes?.severity;
    const severities = {Info: 'info', Warning: 'warning'} as const;
    return {
        id,
        message: error.message || '',
        code: error.code,
        severity: severities[severity as keyof typeof severities] || 'error',
        position: error.attributes?.start_position,
        attributes: error.attributes,
        children: error.inner_errors?.map((child, index) => prepareError(child, `${id}/${index}`)),
    };
}

function isStatisticsRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function prepareStatistics(data: unknown, path: string[] = []): QueryStatisticsItem[] {
    if (!isStatisticsRecord(data)) return [];

    return Object.entries(data)
        .sort(([a], [b]) => a.localeCompare(b))
        .flatMap<QueryStatisticsItem>(([name, value]) => {
            // Statistics also contain scalar metadata such as _id and _cluster_name.
            // In particular, Object.entries('x') contains 'x' again and must never be recursed into.
            if (!isStatisticsRecord(value)) return [];

            const nextPath = [...path, name];
            const item = {id: JSON.stringify(nextPath), name};
            const numeric = (key: string) => {
                const entry = value[key];
                if (typeof entry !== 'number' && (typeof entry !== 'string' || !entry.trim())) {
                    return undefined;
                }
                const number = Number(entry);
                return Number.isFinite(number) ? number : undefined;
            };
            const values = {
                min: numeric('min'),
                max: numeric('max'),
                sum: numeric('sum'),
                count: numeric('count'),
                last: numeric('last'),
                avg: numeric('avg'),
            };
            if (Object.values(values).some((entry) => entry !== undefined)) {
                const {count, sum} = values;
                if (values.avg === undefined && count && sum !== undefined) {
                    values.avg = sum / count;
                }
                return [{...item, values}];
            }
            const children = prepareStatistics(value, nextPath);
            return children.length ? [{...item, children}] : [];
        });
}

export function prepareResult(
    result: QueryResultReadyState,
    typeMap: Parameters<typeof parseV3Type>[1],
    view: QueryResultsView,
): {columns: QueryResultColumn<Record<string, unknown>>[]; rows: Record<string, unknown>[]} {
    const raw = result.rawResult;
    const columns = result.columns.map(({name}) => {
        const cell = raw?.rows.find((row) => row[name])?.[name];
        const type = cell && raw?.yql_type_registry[Number(cell[1])];
        const schema = result.meta.schema?.$value.find((column) => column.name === name);
        // Schema describes the declared column, while Result needs the wire type of its cells.
        const schemaType = () =>
            schema ? parseV3Type(schema.type_v3 as Type, typeMap) : undefined;
        return {
            name,
            type: (view === 'schema' ? schemaType() || type : type || schemaType()) || [
                'UnknownType',
            ],
        };
    });
    return {
        columns,
        rows: (raw?.rows || []).map((row) =>
            Object.fromEntries(Object.entries(row).map(([name, [value]]) => [name, value])),
        ),
    };
}
