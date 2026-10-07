import type {ChartXYFormValues} from '@gravity-ui/querieskit';

import type {DashboardChartDefinition} from '../../types/query-tracker/dashboardCharts';
import type {Result} from '../../types/query-tracker/queryResult';

import {
    describeDashboardItems,
    prepareChartFields,
    prepareDashboardLayout,
    readDashboardConfig,
    restoreDashboardItems,
    updateDashboardResult,
} from './dashboardCharts';

function cell(value: unknown, type = 'yql.int64', incomplete = false): Result {
    return {
        $type: type,
        $value: value,
        $rawValue: String(value),
        $formattedValue: String(value),
        $fullFormattedValue: String(value),
        $incomplete: incomplete,
    };
}

function xy(overrides: Partial<ChartXYFormValues> = {}): ChartXYFormValues {
    return {
        chartType: 'line',
        dimensionFieldId: 'x',
        dimensionAxisType: 'linear',
        measureItems: [{id: 'measure-a', fieldId: 'a'}],
        ...overrides,
    };
}

const definition: DashboardChartDefinition = {
    id: 'chart-a',
    fieldsFormValues: xy({
        dimensionAxisType: 'logarithmic',
        chartTitle: 'Chart title',
        xTitle: 'X title',
        yTitle: 'Y title',
        showLegend: true,
    }),
};
const layout = [{i: 'chart-a', x: 2, y: 3, w: 4, h: 5}];

describe('prepareChartFields', () => {
    it('offers scalar dimensions and numeric measures without materializing field pairs', () => {
        const prepared = prepareChartFields([
            {
                x: cell('category', 'yql.string'),
                a: cell('12'),
                day: cell('2', 'yql.date'),
                missing: cell(null),
                incomplete: cell('17', 'yql.int64', true),
            },
        ]);
        const options = (role: 'dimension' | 'measure' | 'category' | 'value') =>
            prepared.getFieldOptions({chartType: 'line', role}).map(({value}) => value);
        expect(options('dimension')).toEqual(['x', 'a', 'day']);
        expect(options('category')).toEqual(['x', 'a', 'day']);
        expect(options('measure')).toEqual(['a']);
        expect(options('value')).toEqual(['a']);
    });

    it('converts numeric values and skips missing, null, incomplete and nonfinite cells', () => {
        const prepared = prepareChartFields([
            {x: cell('1'), a: cell('12.5', 'yql.double')},
            {x: cell('2'), a: cell(null)},
            {x: cell('3'), a: cell('9', 'yql.int64', true)},
            {x: cell('4'), a: cell('NaN', 'yql.double')},
            {x: cell('5'), a: cell('Infinity', 'yql.double')},
            {x: cell(null), a: cell('6')},
            {a: cell('7')},
            {x: cell('8')},
        ]);
        expect(prepared.getChartData(xy())?.series.data[0].data).toEqual([
            expect.objectContaining({x: 1, y: 12.5}),
        ]);
    });

    it.each([
        ['yql.date', '2', 172800000],
        ['yql.date64', '-1', -86400000],
        ['yql.datetime', '3', 3000],
        ['yql.datetime64', '-3', -3000],
        ['yql.timestamp', '1234000', 1234],
        ['yql.timestamp64', '-1234000', -1234],
    ])('converts %s to milliseconds', (type, value, expected) => {
        const prepared = prepareChartFields([{x: cell(value, type), a: cell('2')}]);
        const chart = prepared.getChartData(xy({dimensionAxisType: 'datetime'}));
        expect(chart?.series.data[0].data).toEqual([expect.objectContaining({x: expected, y: 2})]);
        expect(chart?.xAxis?.type).toBe('datetime');
    });

    it.each([
        ['yql.string', 'category', 'category'],
        ['yql.date', '2', 'datetime'],
        ['yql.int64', '2', 'linear'],
    ] as const)(
        'initializes a %s dimension with the %s value and %s scale',
        (type, value, scale) => {
            const prepared = prepareChartFields([{x: cell(value, type), a: cell('10')}]);
            expect(prepared.getInitialFormValues('line')).toMatchObject({
                chartType: 'line',
                dimensionFieldId: 'x',
                dimensionAxisType: scale,
            });
        },
    );

    it.each(['line', 'area', 'scatter', 'bar-x', 'bar-y'] as const)(
        'preserves measure order and shares categories in %s',
        (chartType) => {
            const prepared = prepareChartFields([
                {x: cell('first', 'yql.string'), a: cell('1'), b: cell(null)},
                {x: cell('second', 'yql.string'), a: cell(null), b: cell('2')},
                {x: cell('third', 'yql.string'), a: cell('3'), b: cell('4')},
            ]);
            const chart = prepared.getChartData(
                xy({
                    chartType,
                    dimensionAxisType: 'category',
                    measureItems: [
                        {id: 'measure-b', fieldId: 'b'},
                        {id: 'measure-a', fieldId: 'a'},
                    ],
                }),
            );
            expect(chart?.series.data).toMatchObject([{name: 'b'}, {name: 'a'}]);
            const domainAxis = chartType === 'bar-y' ? chart?.yAxis?.[0] : chart?.xAxis;
            expect(domainAxis).toMatchObject({
                type: 'category',
                categories: expect.arrayContaining(['first', 'second', 'third']),
            });
            const point = (dimension: string, measure: number) =>
                expect.objectContaining(
                    chartType === 'bar-y' ? {x: measure, y: dimension} : {x: dimension, y: measure},
                );
            expect(chart?.series.data[0].data).toEqual([point('second', 2), point('third', 4)]);
            expect(chart?.series.data[1].data).toEqual([point('first', 1), point('third', 3)]);
        },
    );

    it('preserves one pie point per valid row, including repeated categories', () => {
        const prepared = prepareChartFields([
            {x: cell('same', 'yql.string'), a: cell('2')},
            {x: cell('same', 'yql.string'), a: cell('3')},
            {x: cell('missing', 'yql.string'), a: cell(null)},
        ]);
        const chart = prepared.getChartData({
            chartType: 'pie',
            categoryFieldId: 'x',
            valueFieldId: 'a',
        });
        expect(chart?.series.data[0]).toMatchObject({
            type: 'pie',
            data: [
                {name: 'same', value: 2},
                {name: 'same', value: 3},
            ],
        });
    });

    it('does not render incomplete forms or silently drop missing selected columns', () => {
        const prepared = prepareChartFields([{x: cell('1'), a: cell('2')}]);
        expect(prepared.getChartData(xy({dimensionFieldId: 'missing'}))).toBeUndefined();
        expect(prepared.getChartData(xy({measureItems: []}))).toBeUndefined();
        expect(prepared.getChartData(xy({measureItems: [{id: 'empty'}]}))).toBeUndefined();
        expect(
            prepared.getChartData(
                xy({
                    measureItems: [
                        {id: 'a', fieldId: 'a'},
                        {id: 'b', fieldId: 'missing'},
                    ],
                }),
            ),
        ).toBeUndefined();
        expect(prepared.getChartData({chartType: 'pie', categoryFieldId: 'x'})).toBeUndefined();
        expect(restoreDashboardItems([definition], prepareChartFields([]))).toEqual([]);
    });

    it('uses the same data and appearance when previewing and restoring a chart', () => {
        const prepared = prepareChartFields([{x: cell('1'), a: cell('2')}]);
        const chart = prepared.getChartData(definition.fieldsFormValues);
        expect(chart).toMatchObject({
            title: {text: 'Chart title'},
            xAxis: {type: 'logarithmic', title: {text: 'X title'}},
            yAxis: [{title: {text: 'Y title'}}],
            legend: {enabled: true},
        });
        const restored = restoreDashboardItems([definition], prepared);
        expect(restored).toHaveLength(1);
        expect(restored[0].chartData).toEqual(chart);
        expect(describeDashboardItems(restored)).toEqual([definition]);
    });
});

describe('dashboard annotations', () => {
    it('ignores version 1 and malformed root values', () => {
        for (const value of [undefined, null, [], {}, {version: 1, results: {0: {charts: []}}}]) {
            expect(readDashboardConfig(value)).toEqual({version: 2, results: {}});
        }
    });

    it('roundtrips version 2 form values and layout without persisting chart data', () => {
        const config = {version: 2, results: {0: {charts: [definition], layout}}};
        expect(readDashboardConfig(JSON.parse(JSON.stringify(config)))).toEqual(config);
        const updated = updateDashboardResult(config, 1, {charts: [], layout: []});
        expect(updated).toEqual({
            version: 2,
            results: {0: config.results[0], 1: {charts: [], layout: []}},
        });
        expect(config.results).not.toHaveProperty('1');
        expect(prepareDashboardLayout(['chart-a'], layout)).toEqual(layout);
    });

    it('filters invalid forms, duplicate chart ids and invalid layout entries', () => {
        const invalidForms = [
            {chartType: 'waterfall', measureItems: []},
            {chartType: 'treemap', levels: [], valueFieldId: 'a'},
            xy({dimensionFieldId: undefined}),
            xy({measureItems: []}),
            xy({measureItems: [{id: 'missing'}]}),
            {...xy(), dimensionAxisType: 'invalid'},
            {...xy(), dimensionAxisType: ['linear']},
            {...xy(), chartTitle: 17},
            {...xy(), showLegend: 'yes'},
        ];
        const parsed = readDashboardConfig({
            version: 2,
            results: {
                invalid: {charts: [definition], layout},
                0: {
                    charts: [
                        definition,
                        definition,
                        ...invalidForms.map((fieldsFormValues, index) => ({
                            id: `invalid-${index}`,
                            fieldsFormValues,
                        })),
                    ],
                    layout: [
                        ...layout,
                        {i: 'missing', x: 0, y: 0, w: 2, h: 4},
                        {i: 'chart-a', x: -1, y: 0, w: 2, h: 4},
                        {i: 'chart-a', x: 0, y: 0, w: 0, h: 4},
                        {i: 'chart-a', x: 0.5, y: 0, w: 2, h: 4},
                    ],
                },
            },
        });
        expect(parsed).toEqual({version: 2, results: {0: {charts: [definition], layout}}});
    });
});
