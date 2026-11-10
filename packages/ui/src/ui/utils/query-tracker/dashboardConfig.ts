import {validateChartConfiguration} from '@gravity-ui/querieskit/helpers/validateChartConfiguration';
import type {
    DashboardChartDefinition,
    DashboardChartsConfig,
    DashboardLayoutItem,
    ResultDashboardConfig,
} from '../../types/query-tracker/dashboardCharts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readDashboardChart(value: unknown): DashboardChartDefinition | undefined {
    if (!isRecord(value) || typeof value.id !== 'string' || !value.id) return undefined;
    const validated = validateChartConfiguration(value.fieldsFormValues);
    if (!validated.valid) return undefined;

    const {configuration} = validated;
    switch (configuration.chartType) {
        case 'line':
        case 'area':
        case 'scatter':
        case 'bar-x':
        case 'bar-y':
        case 'pie':
            return {id: value.id, fieldsFormValues: configuration};
        default:
            return undefined;
    }
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
