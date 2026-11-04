import type {
    DashboardChartDefinition,
    DashboardChartFormValues,
    DashboardChartsConfig,
    DashboardLayoutItem,
    ResultDashboardConfig,
} from '../../types/query-tracker/dashboardCharts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readMeasures(items: unknown[]): {id: string; fieldId: string}[] | undefined {
    const ids = new Set<string>();
    const names = new Set<string>();
    const measures: {id: string; fieldId: string}[] = [];
    for (const item of items) {
        if (
            !isRecord(item) ||
            typeof item.id !== 'string' ||
            !item.id ||
            typeof item.fieldId !== 'string' ||
            ids.has(item.id) ||
            names.has(item.fieldId)
        )
            return undefined;
        ids.add(item.id);
        names.add(item.fieldId);
        measures.push({id: item.id, fieldId: item.fieldId});
    }
    return measures;
}

function isXYChartType(
    value: unknown,
): value is Exclude<DashboardChartFormValues['chartType'], 'pie'> {
    return ['line', 'area', 'scatter', 'bar-x', 'bar-y'].some((type) => type === value);
}

function isAxisType(value: unknown): value is 'category' | 'datetime' | 'linear' | 'logarithmic' {
    return ['category', 'datetime', 'linear', 'logarithmic'].some((type) => type === value);
}

function readAppearance(fields: Record<string, unknown>) {
    for (const key of ['chartTitle', 'xTitle', 'yTitle']) {
        if (fields[key] !== undefined && typeof fields[key] !== 'string') return undefined;
    }
    if (fields.showLegend !== undefined && typeof fields.showLegend !== 'boolean') return undefined;
    return {
        ...(typeof fields.chartTitle === 'string' ? {chartTitle: fields.chartTitle} : {}),
        ...(typeof fields.showLegend === 'boolean' ? {showLegend: fields.showLegend} : {}),
    };
}

export function readDashboardChart(value: unknown): DashboardChartDefinition | undefined {
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return undefined;
    const fields = value.fieldsFormValues;
    if (!isRecord(fields)) return undefined;
    const appearance = readAppearance(fields);
    if (!appearance) return undefined;
    let form: DashboardChartFormValues;
    const {chartType} = fields;
    if (chartType === 'pie') {
        if (typeof fields.categoryFieldId !== 'string' || typeof fields.valueFieldId !== 'string')
            return undefined;
        form = {
            ...appearance,
            chartType,
            categoryFieldId: fields.categoryFieldId,
            valueFieldId: fields.valueFieldId,
        };
    } else {
        if (!isXYChartType(chartType)) return undefined;
        const {dimensionAxisType, dimensionFieldId, measureItems} = fields;
        if (
            typeof dimensionFieldId !== 'string' ||
            !Array.isArray(measureItems) ||
            !measureItems.length
        )
            return undefined;
        if (!isAxisType(dimensionAxisType)) return undefined;
        const measures = readMeasures(measureItems);
        if (!measures) return undefined;
        form = {
            ...appearance,
            chartType,
            dimensionFieldId,
            dimensionAxisType,
            measureItems: measures,
            ...(typeof fields.xTitle === 'string' ? {xTitle: fields.xTitle} : {}),
            ...(typeof fields.yTitle === 'string' ? {yTitle: fields.yTitle} : {}),
        };
    }
    return {id: value.id, fieldsFormValues: form};
}

function readLayout(value: unknown, ids: Set<string>): DashboardLayoutItem[] {
    if (!Array.isArray(value)) return [];
    return value
        .filter(
            (item): item is DashboardLayoutItem =>
                isRecord(item) &&
                typeof item.i === 'string' &&
                ids.has(item.i) &&
                ['x', 'y', 'w', 'h'].every(
                    (key) => typeof item[key] === 'number' && Number.isSafeInteger(item[key]),
                ) &&
                Number(item.x) >= 0 &&
                Number(item.y) >= 0 &&
                Number(item.w) > 0 &&
                Number(item.h) > 0,
        )
        .map(({i, x, y, w, h}) => ({i, x, y, w, h}));
}

export function readDashboardConfig(value: unknown): DashboardChartsConfig {
    const config: DashboardChartsConfig = {version: 2, results: {}};
    if (!isRecord(value) || value.version !== 2 || !isRecord(value.results)) return config;
    for (const [index, result] of Object.entries(value.results)) {
        if (!/^\d+$/.test(index) || !isRecord(result) || !Array.isArray(result.charts)) continue;
        const ids = new Set<string>();
        const charts: DashboardChartDefinition[] = [];
        for (const raw of result.charts) {
            const chart = readDashboardChart(raw);
            if (!chart || ids.has(chart.id)) continue;
            ids.add(chart.id);
            charts.push(chart);
        }
        config.results[index] = {charts, layout: readLayout(result.layout, ids)};
    }
    return config;
}

export function updateDashboardResult(
    value: unknown,
    resultIndex: number,
    result: ResultDashboardConfig,
): Record<string, unknown> & {results: Record<string, unknown>} {
    if (!Number.isSafeInteger(resultIndex) || resultIndex < 0)
        throw new Error('Invalid result index');
    if (
        value !== undefined &&
        (!isRecord(value) || value.version !== 2 || !isRecord(value.results))
    ) {
        throw new Error('Unsupported dashboard configuration');
    }
    const stored = (value ?? {version: 2, results: {}}) as Record<string, unknown> & {
        results: Record<string, unknown>;
    };
    const previous = stored.results[resultIndex];
    if (previous !== undefined && (!isRecord(previous) || !Array.isArray(previous.charts))) {
        throw new Error('Unsupported result dashboard configuration');
    }
    const oldResult = previous as Record<string, unknown> | undefined;
    const unknownCharts = ((oldResult?.charts ?? []) as unknown[]).filter(
        (chart) => !readDashboardChart(chart),
    );
    const unknownIds = new Set(
        unknownCharts.flatMap((chart) =>
            isRecord(chart) && typeof chart.id === 'string' ? [chart.id] : [],
        ),
    );
    if (result.charts.some(({id}) => unknownIds.has(id)))
        throw new Error('Dashboard chart id conflict');
    const unknownLayout = Array.isArray(oldResult?.layout)
        ? oldResult.layout.filter(
              (item) => isRecord(item) && typeof item.i === 'string' && unknownIds.has(item.i),
          )
        : [];
    return {
        ...stored,
        results: {
            ...stored.results,
            [resultIndex]: {
                ...oldResult,
                charts: [...result.charts, ...unknownCharts],
                layout: [...result.layout, ...unknownLayout],
            },
        },
    };
}
