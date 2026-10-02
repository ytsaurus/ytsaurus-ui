import type {QueryError, QueryResultMeta} from '../../../../types/query-tracker/api';
import {
    type QueryResultReadyState,
    QueryResultState,
} from '../../../../types/query-tracker/queryResult';
import {prepareError, prepareResult, prepareStatistics} from './adapters';

// Import only the schema converter: the package entrypoint also loads browser components.
jest.mock('@ytsaurus/components', () =>
    jest.requireActual('../../../../../../../components/src/components/SchemaDataType/dateTypesV3'),
);

const typeMap = new Set(['int64', 'string']);

function result(): QueryResultReadyState & {
    rawResult: NonNullable<QueryResultReadyState['rawResult']>;
} {
    return {
        state: QueryResultState.Ready,
        resultReady: true,
        page: 0,
        settings: {pageSize: 100, cellSize: 100},
        columns: [
            {
                name: 'value',
                displayName: 'value',
                type: {} as QueryResultReadyState['columns'][number]['type'],
            },
        ],
        results: [],
        rawResult: {
            all_column_names: ['value'],
            incomplete_all_column_names: false,
            incomplete_columns: false,
            rows: [{value: [['9007199254740993'], '0']}],
            yql_type_registry: [['OptionalType', ['DataType', 'Int64']]],
        },
        meta: {
            schema: {$value: [{name: 'value', type_v3: {type_name: 'optional', item: 'string'}}]},
        } as QueryResultMeta,
    };
}

describe('execution panel adapters', () => {
    test('preserves raw optional values and takes types from the response registry', () => {
        const data = result();
        const prepared = prepareResult(data, typeMap);
        expect(prepared.rows).toEqual([{value: ['9007199254740993']}]);
        expect(prepared.columns[0].type).toEqual(['OptionalType', ['DataType', 'Int64']]);
        expect(prepared.rows[0].value).toBe(data.rawResult.rows[0].value[0]);
    });

    test('keeps null and nested wire values without formatting or coercion', () => {
        const data = result();
        data.rawResult.rows = [{value: [null, '0']}, {value: [[['x', ['1', '2']]], '1']}];
        data.rawResult.yql_type_registry.push(['ListType', ['DataType', 'String']]);
        expect(prepareResult(data, typeMap).rows).toEqual([
            {value: null},
            {value: [['x', ['1', '2']]]},
        ]);
    });

    test('uses schema for empty results and retains columns hidden from the data view', () => {
        const data = result();
        data.rawResult.rows = [];
        data.settings.visibleColumns = [];
        expect(prepareResult(data, typeMap)).toEqual({
            rows: [],
            columns: [{name: 'value', type: ['OptionalType', ['DataType', 'String']]}],
        });
    });

    test('does not mutate or mix different results', () => {
        const first = result();
        const second = result();
        second.rawResult.rows = [{value: ['second', '0']}];
        const original = JSON.stringify(first);
        expect(prepareResult(first, typeMap).rows).not.toEqual(prepareResult(second, typeMap).rows);
        expect(JSON.stringify(first)).toBe(original);
    });

    test('maps nested error severity, source positions and attributes', () => {
        const error = {
            message: 'failed',
            code: 42,
            attributes: {},
            inner_errors: [
                {
                    message: 'warning',
                    attributes: {severity: 'Warning', start_position: {row: 3, column: 7}},
                    inner_errors: [{message: 'note', attributes: {severity: 'Info'}}],
                },
            ],
        } as QueryError;
        const prepared = prepareError(error);
        expect(prepared).toMatchObject({id: 'error', severity: 'error', code: 42});
        expect(prepared.children?.[0]).toMatchObject({
            id: 'error/0',
            severity: 'warning',
            position: {row: 3, column: 7},
        });
        expect(prepared.children?.[0].children?.[0].severity).toBe('info');
    });

    test('ignores scalar operation metadata without recursing into strings', () => {
        const statistics = {
            operation: {
                _id: 'operation-id',
                _cluster_name: 'test-cluster',
                _version: 1,
                empty: null,
                enabled: true,
                nested: {Rows: {min: 1, max: 3, sum: 4, count: 2}},
            },
        };
        expect(prepareStatistics(statistics)).toEqual([
            {
                id: '["operation"]',
                name: 'operation',
                children: [
                    {
                        id: '["operation","nested"]',
                        name: 'nested',
                        children: [
                            {
                                id: '["operation","nested","Rows"]',
                                name: 'Rows',
                                values: {min: 1, max: 3, sum: 4, count: 2, last: undefined, avg: 2},
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    test('accepts numeric aggregate strings and preserves zero averages', () => {
        expect(prepareStatistics({Rows: {min: '0', max: '4', sum: '0', count: '2'}})).toEqual([
            {
                id: '["Rows"]',
                name: 'Rows',
                values: {min: 0, max: 4, sum: 0, count: 2, last: undefined, avg: 0},
            },
        ]);
    });

    test.each([undefined, null, 'cluster-name', 42, true])(
        'ignores non-object statistics: %s',
        (data) => {
            expect(prepareStatistics(data)).toEqual([]);
        },
    );

    test('ignores empty or non-numeric aggregates and keeps partial metrics', () => {
        expect(
            prepareStatistics({
                metadata: {_id: 'x'},
                invalid: {sum: '', count: 'unknown', last: null},
                partial: {max: '3'},
            }),
        ).toEqual([
            {
                id: '["partial"]',
                name: 'partial',
                values: {
                    min: undefined,
                    max: 3,
                    sum: undefined,
                    count: undefined,
                    last: undefined,
                    avg: undefined,
                },
            },
        ]);
    });

    test('creates stable metric IDs, sorts groups and calculates averages', () => {
        const values = {min: 1, max: 3, sum: 4, count: 2, last: 3};
        const [group] = prepareStatistics({engine: {metric: values}});
        expect(group).toEqual({
            id: '["engine"]',
            name: 'engine',
            children: [
                {
                    id: '["engine","metric"]',
                    name: 'metric',
                    values: {...values, avg: 2},
                },
            ],
        });
        expect(prepareStatistics({metric: {...values, count: 0}})[0]).toMatchObject({
            values: {avg: undefined},
        });
        expect(prepareStatistics({})).toEqual([]);
    });
});
