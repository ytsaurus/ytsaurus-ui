import type {ErrorTreeItem, QueryResultColumn, QueryStatisticsItem} from '@gravity-ui/querieskit';
import {type Type, parseV3Type} from '@ytsaurus/components';

import type {QueryError} from '../../../../types/query-tracker/api';
import type {SourceQueryResultReadyState as QueryResultReadyState} from '../../../../types/query-tracker/queryResult';

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

export function prepareResultColumns(
    result: QueryResultReadyState,
    typeMap: Parameters<typeof parseV3Type>[1],
): QueryResultColumn<QueryResultReadyState['results'][number]>[] {
    return result.columns.map(({name, displayName}) => {
        const schema = result.meta.schema?.$value.find((column) => column.name === name);
        return {
            name,
            header: displayName,
            type: (schema ? parseV3Type(schema.type_v3 as Type, typeMap) : undefined) || [
                'UnknownType',
            ],
        };
    });
}
