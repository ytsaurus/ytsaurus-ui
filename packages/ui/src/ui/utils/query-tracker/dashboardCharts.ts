import type {DashboardChartsProps} from '@gravity-ui/querieskit/widgets/DashboardCharts';

import type {
    DashboardChartDefinition,
    DashboardChartsConfig,
    DashboardLayoutItem,
    ResultDashboardConfig,
} from '../../types/query-tracker/dashboardCharts';
import type {QueryResultReadyState, Result} from '../../types/query-tracker/queryResult';
import {DateTime64Types, DateTimeTypes, NumberTypes} from '../../types/query-tracker/yqlTypes';

type ChartType = DashboardChartDefinition['type'];
export type DashboardItem = NonNullable<DashboardChartsProps['chartItems']>[number];
type Series = DashboardItem['chartData']['series']['data'][number];
type SeriesMap = NonNullable<DashboardChartsProps['dataSource']['line']>;
type Rows = QueryResultReadyState['results'];

const chartTypes: ChartType[] = ['line', 'area', 'bar-x', 'bar-y', 'scatter', 'pie', 'waterfall'];
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
    return typeof value === 'string' ? value : undefined;
}

// JSON quoting makes the human-readable series keys unambiguous even for unusual column names.
export function chartSeriesId(xField: string, yField: string) {
    return `Y: ${JSON.stringify(yField)}, X: ${JSON.stringify(xField)}`;
}

export function prepareChartDataSource(rows: Rows) {
    const fields = [...new Set(rows.flatMap((row) => Object.keys(row)))];
    const cells = new Map(
        fields.map((field) => [
            field,
            rows.find((row) => pointValue(row[field]) !== undefined)?.[field],
        ]),
    );
    const xFields = fields.filter((field) => cells.get(field));
    const yFields = fields.filter((field) => numericTypes.has(cells.get(field)?.$type || ''));
    const references = new Map<string, {xField: string; yField: string}>();
    const dataSource: DashboardChartsProps['dataSource'] = {};
    for (const type of chartTypes) {
        const map: SeriesMap = Object.create(null);
        for (const xField of xFields) {
            for (const yField of yFields) {
                const id = chartSeriesId(xField, yField);
                references.set(id, {xField, yField});
                // Wide results can have many pairs. Allocate points only for selected series.
                let series: Series | undefined;
                Object.defineProperty(map, id, {
                    enumerable: true,
                    get: () => {
                        if (!series) {
                            const points = rows.flatMap((row) => {
                                const x = pointValue(row[xField]);
                                const y = pointValue(row[yField]);
                                if (x === undefined || typeof y !== 'number') return [];
                                return [{x, y}];
                            });
                            const categories = [...new Set(points.map(({x}) => String(x)))];
                            const categoryIndices = new Map(
                                categories.map((value, index) => [value, index]),
                            );
                            const data = points.map(({x, y}) => {
                                if (type === 'pie') return {name: String(x), value: y};
                                // The native editor starts with a linear axis. Category coordinates
                                // remain numeric there; labels are restored on the saved chart.
                                const coordinate =
                                    typeof x === 'string' ? (categoryIndices.get(x) ?? 0) : x;
                                return type === 'bar-y'
                                    ? {x: y, y: coordinate, name: String(x)}
                                    : {x: coordinate, y, name: String(x)};
                            });
                            series = {type, name: id, seriesId: id, data} as Series;
                        }
                        return series;
                    },
                });
            }
        }
        if (Object.keys(map).length) dataSource[type] = map;
    }
    return {dataSource, references, cells};
}

export function describeDashboardItems(
    items: DashboardItem[],
    references: ReturnType<typeof prepareChartDataSource>['references'],
): DashboardChartDefinition[] {
    return items.flatMap(({id, chartData}) => {
        const type = chartData.series.data[0]?.type;
        if (!chartTypes.includes(type as ChartType)) return [];
        const series = chartData.series.data.flatMap(({seriesId}) => {
            const reference = references.get(seriesId);
            return reference ? [reference] : [];
        });
        if (!series.length) return [];
        return [
            {
                id,
                type: type as ChartType,
                series,
                title: chartData.title?.text,
                xTitle: chartData.xAxis?.title?.text,
                yTitle: chartData.yAxis?.[0]?.title?.text,
                axisType:
                    type === 'bar-y'
                        ? chartData.yAxis?.[0]?.type || chartData.xAxis?.type
                        : chartData.xAxis?.type,
                showLegend: chartData.legend?.enabled,
            },
        ];
    });
}

export function restoreDashboardItems(
    definitions: DashboardChartDefinition[],
    rows: Rows,
    prepared = prepareChartDataSource(rows),
): DashboardItem[] {
    return definitions.flatMap((definition) => {
        const {id, type, series: references, title, xTitle, yTitle, showLegend} = definition;
        const series = references.flatMap(({xField, yField}) => {
            const value = prepared.dataSource[type]?.[chartSeriesId(xField, yField)];
            return value ? [value] : [];
        });
        if (series.length !== references.length || !series.length) return [];
        const categorical = references.some(({xField}) => {
            const cell = prepared.cells.get(xField);
            return cell && !numericTypes.has(cell.$type) && !dateTypes.has(cell.$type);
        });
        const datetime = references.every(({xField}) =>
            dateTypes.has(prepared.cells.get(xField)?.$type || ''),
        );
        let axisType = definition.axisType || 'linear';
        if (datetime && axisType === 'linear') axisType = 'datetime';
        if (categorical) axisType = 'category';
        const categories = [
            ...new Set(
                references.flatMap(({xField, yField}) =>
                    rows.flatMap((row) => {
                        const x = pointValue(row[xField]);
                        return x !== undefined && typeof pointValue(row[yField]) === 'number'
                            ? [String(x)]
                            : [];
                    }),
                ),
            ),
        ];
        // Rebuild category coordinates against a shared domain when several series are selected.
        const data =
            axisType === 'category' && type !== 'pie'
                ? references.flatMap(({xField, yField}) => {
                      const original = prepared.dataSource[type]?.[chartSeriesId(xField, yField)];
                      if (!original) return [];
                      return [
                          {
                              ...original,
                              data: rows.flatMap((row) => {
                                  const x = pointValue(row[xField]);
                                  const y = pointValue(row[yField]);
                                  if (x === undefined || typeof y !== 'number') return [];
                                  return [
                                      type === 'bar-y' ? {x: y, y: String(x)} : {x: String(x), y},
                                  ];
                              }),
                          } as Series,
                      ];
                  })
                : series;
        const domainAxis = {type: axisType, ...(axisType === 'category' ? {categories} : {})};
        return [
            {
                id,
                chartData: {
                    series: {data},
                    title: title ? {text: title} : undefined,
                    xAxis: {
                        ...(type === 'bar-y' ? {type: 'linear' as const} : domainAxis),
                        title: {text: xTitle},
                    },
                    yAxis: [{...(type === 'bar-y' ? domainAxis : {}), title: {text: yTitle}}],
                    legend: {enabled: Boolean(showLegend)},
                },
            },
        ];
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Annotations can be written by other clients: ignore unsupported or malformed definitions.
export function readDashboardConfig(value: unknown): DashboardChartsConfig {
    const empty: DashboardChartsConfig = {version: 1, results: {}};
    if (!isRecord(value) || value.version !== 1 || !isRecord(value.results)) return empty;
    for (const [index, result] of Object.entries(value.results)) {
        if (!/^\d+$/.test(index) || !isRecord(result) || !Array.isArray(result.charts)) continue;
        const ids = new Set<string>();
        const charts = result.charts.filter((chart): chart is DashboardChartDefinition => {
            if (
                !isRecord(chart) ||
                typeof chart.id !== 'string' ||
                !chart.id ||
                ids.has(chart.id) ||
                !chartTypes.includes(chart.type as ChartType) ||
                !Array.isArray(chart.series) ||
                !chart.series.length
            )
                return false;
            if (
                !chart.series.every(
                    (series) =>
                        isRecord(series) &&
                        typeof series.xField === 'string' &&
                        typeof series.yField === 'string',
                )
            )
                return false;
            if (
                ['title', 'xTitle', 'yTitle'].some(
                    (key) => chart[key] !== undefined && typeof chart[key] !== 'string',
                )
            )
                return false;
            if (chart.axisType !== undefined && !axisTypes.includes(String(chart.axisType)))
                return false;
            if (chart.showLegend !== undefined && typeof chart.showLegend !== 'boolean')
                return false;
            ids.add(chart.id);
            return true;
        });
        const layout = Array.isArray(result.layout)
            ? result.layout.filter(
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
            : [];
        empty.results[index] = {charts, layout};
    }
    return empty;
}

// DashboardCharts 2.0.2 matches defaultLayout by array position, not by id.
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
