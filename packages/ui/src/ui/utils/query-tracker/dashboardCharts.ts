import type {
    ChartData,
    ChartEditorOption,
    ChartFieldOptionsContext,
    ChartFieldsChartType,
    ChartFieldsFormValues,
    ChartSelectedFormValues,
    DashboardItem,
} from '@gravity-ui/querieskit';

import type {
    DashboardChartDefinition,
    DashboardChartFormValues,
    DashboardChartsConfig,
    DashboardLayoutItem,
    ResultDashboardConfig,
} from '../../types/query-tracker/dashboardCharts';
import type {QueryResultReadyState, Result} from '../../types/query-tracker/queryResult';
import {DateTime64Types, DateTimeTypes, NumberTypes} from '../../types/query-tracker/yqlTypes';

type Rows = QueryResultReadyState['results'];
type Series = ChartData['series']['data'][number];

export const dashboardChartTypes = ['line', 'area', 'scatter', 'bar-x', 'bar-y', 'pie'] as const;
const axisTypes = ['linear', 'datetime', 'logarithmic', 'category'];
const numericTypes = new Set([...NumberTypes, 'yql.int8', 'yql.int16', 'yql.uint16']);
const dateTypes = new Set([...DateTimeTypes, ...DateTime64Types]);

function pointValue(cell?: Result): string | number | undefined {
    if (!cell || cell.$value === null || cell.$value === undefined || cell.$incomplete)
        return undefined;
    let value: unknown = cell.$rawValue;
    if (numericTypes.has(cell.$type)) value = Number(cell.$value);
    // YQL timestamps are microseconds, datetimes are seconds, dates are days.
    if (dateTypes.has(cell.$type)) {
        let scale = 1000;
        if (cell.$type === 'yql.date' || cell.$type === 'yql.date64') scale = 86_400_000;
        if (cell.$type === 'yql.timestamp' || cell.$type === 'yql.timestamp64') scale = 0.001;
        value = Number(cell.$value) * scale;
    }
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    return typeof value === 'string' && typeof cell.$value !== 'object' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Pick only supported settings: annotations may be written by other clients.
function readFormValues(value: unknown): DashboardChartFormValues | undefined {
    if (!isRecord(value)) return undefined;
    if (
        ['chartTitle', 'xTitle', 'yTitle'].some(
            (key) => value[key] !== undefined && typeof value[key] !== 'string',
        ) ||
        (value.showLegend !== undefined && typeof value.showLegend !== 'boolean')
    )
        return undefined;
    const appearance = {
        chartTitle: value.chartTitle as string | undefined,
        showLegend: value.showLegend as boolean | undefined,
    };
    if (value.chartType === 'pie') {
        if (
            ![value.categoryFieldId, value.valueFieldId].every((field) => typeof field === 'string')
        )
            return undefined;
        return {
            ...appearance,
            chartType: 'pie',
            categoryFieldId: value.categoryFieldId as string,
            valueFieldId: value.valueFieldId as string,
        };
    }
    const chartType = dashboardChartTypes.find((type) => type === value.chartType);
    if (
        !chartType ||
        chartType === 'pie' ||
        typeof value.dimensionFieldId !== 'string' ||
        !axisTypes.some((axis) => axis === value.dimensionAxisType) ||
        !Array.isArray(value.measureItems) ||
        !value.measureItems.length
    )
        return undefined;
    const ids = new Set<string>();
    const fields = new Set<string>();
    const measureItems: Array<{id: string; fieldId: string}> = [];
    for (const item of value.measureItems) {
        if (
            !isRecord(item) ||
            typeof item.id !== 'string' ||
            !item.id ||
            typeof item.fieldId !== 'string' ||
            ids.has(item.id) ||
            fields.has(item.fieldId)
        )
            return undefined;
        ids.add(item.id);
        fields.add(item.fieldId);
        measureItems.push({id: item.id, fieldId: item.fieldId});
    }
    return {
        ...appearance,
        chartType,
        dimensionFieldId: value.dimensionFieldId,
        dimensionAxisType: value.dimensionAxisType as
            'linear' | 'datetime' | 'logarithmic' | 'category',
        measureItems,
        xTitle: value.xTitle as string | undefined,
        yTitle: value.yTitle as string | undefined,
    };
}

// Discover columns once; build points only for the fields selected in a chart.
export function prepareChartFields(rows: Rows) {
    const cells = new Map<string, Result>();
    for (const row of rows) {
        for (const [field, cell] of Object.entries(row)) {
            if (!cells.has(field) && pointValue(cell) !== undefined) cells.set(field, cell);
        }
    }
    const dimensions: ChartEditorOption[] = [...cells.keys()].map((value) => ({
        value,
        content: value,
    }));
    const measures = dimensions.filter(({value}) =>
        numericTypes.has(cells.get(value)?.$type || ''),
    );
    const getFieldOptions = ({role}: ChartFieldOptionsContext) =>
        role === 'measure' || role === 'value' ? measures : dimensions;
    const getInitialFormValues = (chartType: ChartFieldsChartType): ChartFieldsFormValues => {
        if (chartType === 'pie')
            return {
                chartType,
                categoryFieldId: dimensions[0]?.value,
                valueFieldId: measures[0]?.value,
            };
        if (chartType === 'treemap' || chartType === 'sankey') return {};
        const dimensionFieldId = dimensions[0]?.value;
        const type =
            dimensionFieldId === undefined ? undefined : cells.get(dimensionFieldId)?.$type;
        let dimensionAxisType: 'linear' | 'datetime' | 'category' = 'category';
        if (numericTypes.has(type || '')) dimensionAxisType = 'linear';
        if (dateTypes.has(type || '')) dimensionAxisType = 'datetime';
        return {
            chartType,
            dimensionFieldId,
            dimensionAxisType,
            measureItems: [{id: 'measure-0', fieldId: measures[0]?.value}],
        };
    };
    const getChartData = (input: ChartSelectedFormValues): ChartData | undefined => {
        const values = readFormValues(input);
        if (!values) return undefined;
        const appearance = {
            title: {text: values.chartTitle || ''},
            legend: {enabled: Boolean(values.showLegend)},
        };
        if (values.chartType === 'pie') {
            const {categoryFieldId, valueFieldId} = values;
            if (
                categoryFieldId === undefined ||
                valueFieldId === undefined ||
                !cells.has(categoryFieldId) ||
                !measures.some(({value}) => value === valueFieldId)
            )
                return undefined;
            const data = rows.flatMap((row) => {
                const category = pointValue(row[categoryFieldId]);
                const value = pointValue(row[valueFieldId]);
                return category !== undefined && typeof value === 'number'
                    ? [{name: String(category), value}]
                    : [];
            });
            return data.length
                ? {
                      ...appearance,
                      series: {data: [{type: 'pie', seriesId: 'pie', data}]},
                  }
                : undefined;
        }
        const {dimensionFieldId, dimensionAxisType, measureItems, chartType} = values;
        if (
            dimensionFieldId === undefined ||
            !cells.has(dimensionFieldId) ||
            measureItems.some(({fieldId}) => !measures.some(({value}) => value === fieldId))
        )
            return undefined;
        const categorical = dimensionAxisType === 'category';
        const categories = new Set<string>();
        const series = measureItems.map(({id, fieldId}) => {
            const data = rows.flatMap((row) => {
                const dimension = pointValue(row[dimensionFieldId]);
                const measure = fieldId === undefined ? undefined : pointValue(row[fieldId]);
                if (
                    dimension === undefined ||
                    typeof measure !== 'number' ||
                    (!categorical && typeof dimension !== 'number')
                )
                    return [];
                const coordinate = categorical ? String(dimension) : dimension;
                if (categorical) categories.add(String(dimension));
                return [
                    chartType === 'bar-y'
                        ? {x: measure, y: coordinate}
                        : {x: coordinate, y: measure},
                ];
            });
            return {type: chartType, seriesId: id, name: fieldId, data} as Series;
        });
        if (!series.some(({data}) => data.length)) return undefined;
        const domainAxis = {
            type: dimensionAxisType,
            ...(categorical ? {categories: [...categories]} : {}),
        };
        return {
            ...appearance,
            series: {data: series},
            xAxis: {
                ...(chartType === 'bar-y' ? {type: 'linear' as const} : domainAxis),
                title: {text: values.xTitle || ''},
            },
            yAxis: [
                {
                    ...(chartType === 'bar-y' ? domainAxis : {type: 'linear' as const}),
                    title: {text: values.yTitle || ''},
                },
            ],
        };
    };
    return {getFieldOptions, getInitialFormValues, getChartData};
}

export function describeDashboardItems(items: DashboardItem[]): DashboardChartDefinition[] {
    return items.flatMap(({id, fieldsFormValues}) => {
        const values = readFormValues(fieldsFormValues);
        return values ? [{id, fieldsFormValues: values}] : [];
    });
}

export function restoreDashboardItems(
    definitions: DashboardChartDefinition[],
    prepared: ReturnType<typeof prepareChartFields>,
): DashboardItem[] {
    return definitions.flatMap(({id, fieldsFormValues}) => {
        const chartData = prepared.getChartData(fieldsFormValues);
        return chartData ? [{id, fieldsFormValues, chartData}] : [];
    });
}

export function readDashboardConfig(value: unknown): DashboardChartsConfig {
    const empty: DashboardChartsConfig = {version: 2, results: {}};
    if (!isRecord(value) || value.version !== 2 || !isRecord(value.results)) return empty;
    for (const [index, result] of Object.entries(value.results)) {
        if (!/^\d+$/.test(index) || !isRecord(result) || !Array.isArray(result.charts)) continue;
        const ids = new Set<string>();
        const charts = result.charts.flatMap((chart): DashboardChartDefinition[] => {
            if (!isRecord(chart) || typeof chart.id !== 'string' || !chart.id || ids.has(chart.id))
                return [];
            const fieldsFormValues = readFormValues(chart.fieldsFormValues);
            if (!fieldsFormValues) return [];
            ids.add(chart.id);
            return [{id: chart.id, fieldsFormValues}];
        });
        const layout = Array.isArray(result.layout)
            ? result.layout
                  .filter(
                      (item): item is DashboardLayoutItem =>
                          isRecord(item) &&
                          typeof item.i === 'string' &&
                          ids.has(item.i) &&
                          ['x', 'y', 'w', 'h'].every(
                              (key) =>
                                  typeof item[key] === 'number' &&
                                  Number.isFinite(item[key]) &&
                                  Number.isInteger(item[key]),
                          ) &&
                          Number(item.x) >= 0 &&
                          Number(item.y) >= 0 &&
                          Number(item.w) > 0 &&
                          Number(item.h) > 0,
                  )
                  .map(({i, x, y, w, h}) => ({i, x, y, w, h}))
            : [];
        empty.results[index] = {charts, layout};
    }
    return empty;
}

// DashboardCharts matches defaultLayout by array position, not by id.
export function prepareDashboardLayout(
    ids: string[],
    layout: DashboardLayoutItem[],
): DashboardLayoutItem[] {
    const byId = new Map(layout.map((item) => [item.i, item]));
    let bottom = Math.max(0, ...layout.map(({y, h}) => y + h));
    return ids.map((id) => {
        const saved = byId.get(id);
        if (saved) return saved;
        const item = {i: id, x: 0, y: bottom, w: 2, h: 4};
        bottom += item.h;
        return item;
    });
}

export function updateDashboardResult(
    value: unknown,
    resultIndex: number,
    result: ResultDashboardConfig,
): DashboardChartsConfig {
    const config = readDashboardConfig(value);
    return {...config, results: {...config.results, [resultIndex]: result}};
}
