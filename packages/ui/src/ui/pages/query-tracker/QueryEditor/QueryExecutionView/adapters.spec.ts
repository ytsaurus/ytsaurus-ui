import type {Type} from '@ytsaurus/components';

import type {QueryResultMeta} from '../../../../types/query-tracker/api';
import {
    type QueryResultReadyState,
    QueryResultState,
} from '../../../../types/query-tracker/queryResult';
import {prepareResult} from './adapters';

// Load the real parser without the package's browser-only component exports.
jest.mock('@ytsaurus/components', () =>
    jest.requireActual(
        require
            .resolve('@ytsaurus/components')
            .replace(/index\.js$/, 'components/SchemaDataType/dateTypesV3.js'),
    ),
);

const typeMap = new Set(['string', 'int64', 'float']);

function makeResult(
    type: Type = {type_name: 'optional', item: 'int64'},
): QueryResultReadyState & {rawResult: NonNullable<QueryResultReadyState['rawResult']>} {
    return {
        state: QueryResultState.Ready,
        resultReady: true,
        columns: [{name: 'value', displayName: 'value', type: {name: 'Int64'}}],
        results: [],
        page: 0,
        settings: {pageSize: 100, cellSize: 100},
        meta: {
            schema: {$value: [{name: 'value', type_v3: type}]},
        } as unknown as QueryResultMeta,
        rawResult: {
            all_column_names: ['value'],
            incomplete_all_column_names: false,
            incomplete_columns: false,
            rows: [{value: ['42', '0']}],
            yql_type_registry: [['DataType', 'Int64']],
        },
    };
}

describe('prepareResult', () => {
    it('uses declared optional types for Schema and wire types for Result', () => {
        const result = makeResult();
        expect(prepareResult(result, typeMap, 'schema').columns[0].type).toEqual([
            'OptionalType',
            ['DataType', 'Int64'],
        ]);
        expect(prepareResult(result, typeMap, 'result').columns[0].type).toEqual([
            'DataType',
            'Int64',
        ]);
    });

    it.each(['schema', 'result'] as const)('preserves schema without rows in %s', (view) => {
        const result = makeResult();
        result.rawResult.rows = [];
        expect(prepareResult(result, typeMap, view)).toEqual({
            columns: [{name: 'value', type: ['OptionalType', ['DataType', 'Int64']]}],
            rows: [],
        });
    });

    it('preserves nested fields and their modifiers', () => {
        const result = makeResult({
            type_name: 'struct',
            members: [
                {name: 'id', type: 'int64'},
                {
                    name: 'payload',
                    type: {
                        type_name: 'optional',
                        item: {type_name: 'tagged', tag: 'json', item: 'string'},
                    },
                },
            ],
        });
        expect(prepareResult(result, typeMap, 'schema').columns[0].type).toEqual([
            'StructType',
            [
                ['id', ['DataType', 'Int64']],
                ['payload', ['OptionalType', ['TaggedType', 'json', ['DataType', 'String']]]],
            ],
        ]);
    });

    it.each(['schema', 'result'] as const)(
        'falls back to wire types then Unknown in %s',
        (view) => {
            const result = makeResult();
            result.meta.schema.$value = [];
            expect(prepareResult(result, typeMap, view).columns[0].type).toEqual([
                'DataType',
                'Int64',
            ]);
            expect(
                prepareResult({...result, rawResult: undefined}, typeMap, view).columns[0].type,
            ).toEqual(['UnknownType']);
        },
    );

    it.each(['schema', 'result'] as const)(
        'preserves column order and row values in %s',
        (view) => {
            const result = makeResult();
            result.columns.unshift({name: 'label', displayName: 'label', type: {name: 'String'}});
            result.rawResult.rows[0].label = ['example', '1'];
            result.rawResult.yql_type_registry.push(['DataType', 'String']);
            const original = JSON.stringify(result);
            const prepared = prepareResult(result, typeMap, view);
            expect(prepared.columns.map(({name}) => name)).toEqual(['label', 'value']);
            expect(prepared.rows).toEqual([{value: '42', label: 'example'}]);
            expect(JSON.stringify(result)).toBe(original);
        },
    );
});
