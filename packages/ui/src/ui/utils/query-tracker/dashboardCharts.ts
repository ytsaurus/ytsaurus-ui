import unipika from '../../common/thor/unipika';
import type {ChartDefinition, TabularChartField} from '@gravity-ui/querieskit';
import {createTabularChartSource} from '@gravity-ui/querieskit/helpers/createTabularChartSource';
import type {DashboardChartDefinition} from '../../types/query-tracker/dashboardCharts';
import {readDashboardChart} from './dashboardConfig';
import type {
    SourceQueryResultReadyState as QueryResultReadyState,
    SourceCell,
} from '../../types/query-tracker/queryResult';
import {DateTime64Types, DateTimeTypes, NumberTypes} from '../../types/query-tracker/yqlTypes';

export const dashboardChartTypes = ['line', 'area', 'scatter', 'bar-x', 'bar-y', 'pie'] as const;
const numericTypes = new Set([...NumberTypes, 'yql.int8', 'yql.int16', 'yql.uint16']);
const dateTypes = new Set([...DateTimeTypes, ...DateTime64Types]);

export function pointValue(cell?: SourceCell): string | number | undefined {
    if (!cell) return undefined;
    try {
        const flags = {incomplete: false};
        const converted = unipika.converters.yql(
            [cell.value, cell.type],
            {treatValAsData: true},
            flags,
        );
        if (flags.incomplete || converted.$value === null || converted.$value === undefined)
            return undefined;
        const type = converted.$type;
        let value: unknown = converted.$value;
        if (numericTypes.has(type)) value = Number(value);
        if (dateTypes.has(type)) {
            let scale = 1000;
            if (type === 'yql.date' || type === 'yql.date64') scale = 86_400_000;
            if (type === 'yql.timestamp' || type === 'yql.timestamp64') scale = 0.001;
            value = Number(value) * scale;
        }
        if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
        if (typeof value === 'boolean') return String(value);
        return typeof value === 'string' ? value : undefined;
    } catch {
        return undefined;
    }
}

function wireChartFieldType(
    type: SourceCell['type'],
): TabularChartField['type'] | null | undefined {
    if (type?.[0] === 'OptionalType') return wireChartFieldType(type[1] as SourceCell['type']);
    if (type?.[0] === 'TaggedType') return wireChartFieldType(type[2] as SourceCell['type']);
    return type?.[0] === 'DataType' ? chartFieldType(type[1]) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function chartFieldType(type: unknown): TabularChartField['type'] | null | undefined {
    if (isRecord(type)) {
        if (type.type_name === 'optional' || type.type_name === 'tagged') {
            return chartFieldType(type.item);
        }
        if (
            [
                'list',
                'dict',
                'struct',
                'tuple',
                'variant',
                'variant_struct',
                'variant_tuple',
            ].includes(String(type.type_name))
        )
            return null;
        return chartFieldType(type.type_name);
    }
    if (typeof type !== 'string') return undefined;
    const name = type.toLowerCase().replace(/^yql\./, '');
    if (numericTypes.has(`yql.${name}`)) return 'number';
    if (dateTypes.has(`yql.${name}`)) return 'datetime';
    if (['string', 'utf8', 'bool', 'boolean', 'uuid', 'json'].includes(name)) return 'string';
    return undefined;
}

export function prepareChartFields(result?: QueryResultReadyState) {
    const rows = result?.results ?? [];
    const schema = new Map(result?.meta.schema?.$value.map((column) => [column.name, column]));
    const names = new Set([
        ...(result?.columns.map(({name}) => name) ?? []),
        ...schema.keys(),
        ...rows.flatMap((row) => Object.keys(row.cells)),
    ]);
    const fields: TabularChartField[] = [];
    for (const id of names) {
        const column = schema.get(id);
        let type = chartFieldType(column?.type_v3 ?? column?.type);
        if (type === undefined) {
            const cell = rows.find((row) => pointValue(row.cells[id]) !== undefined)?.cells[id];
            if (cell)
                type =
                    wireChartFieldType(cell.type) ??
                    (typeof pointValue(cell) === 'string' ? 'string' : undefined);
        }
        if (type) fields.push({id, name: id, type});
    }
    return createTabularChartSource({
        fields,
        rows,
        getValue: (row, fieldId) => pointValue(row.cells[fieldId]),
        chartTypes: dashboardChartTypes,
    });
}

export function toChartDefinitions(charts: DashboardChartDefinition[]): ChartDefinition[] {
    return charts.map((chart) => {
        const stored = readDashboardChart(chart);
        if (!stored) throw new Error('Invalid dashboard chart');
        return {id: stored.id, version: 1, fieldsFormValues: stored.fieldsFormValues};
    });
}

export function fromChartDefinitions(definitions: ChartDefinition[]): DashboardChartDefinition[] {
    return definitions.map((definition) => {
        const stored = readDashboardChart(definition);
        if (!stored) throw new Error('Unsupported dashboard chart');
        return stored;
    });
}
