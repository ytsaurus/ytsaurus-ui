import type {NavigationTable, NavigationTableSchema} from '@ytsaurus/components';

import {prepareNavigationPreview, prepareNavigationSchema} from './adapters';

function makeTable(overrides: Partial<NavigationTable> = {}): NavigationTable {
    return {
        name: 'table',
        rows: [],
        columns: [],
        schema: [],
        meta: [],
        yqlTypes: null,
        ...overrides,
    };
}

function makeSchema(name: string): NavigationTableSchema {
    return {name, type: 'string', required: false};
}

describe('prepareNavigationSchema', () => {
    test('maps valid sort orders and preserves schema metadata without mutation', () => {
        const schema = [
            {...makeSchema('a'), sort_order: 'ascending', type_v3: {type_name: 'optional'}},
            {...makeSchema('b'), sort_order: 'descending', required: true},
            {...makeSchema('c'), sort_order: 'unexpected'},
            makeSchema('d'),
        ];
        const prepared = prepareNavigationSchema(schema);
        expect(prepared.map(({sortOrder}) => sortOrder)).toEqual([
            'ascending',
            'descending',
            undefined,
            undefined,
        ]);
        expect(prepared[0]).toMatchObject(schema[0]);
        expect(prepared[1].required).toBe(true);
        expect(prepared[0]).not.toBe(schema[0]);
        expect(schema[0]).not.toHaveProperty('sortOrder');
    });
});

describe('prepareNavigationPreview', () => {
    test('unwraps YQL cells while preserving optional, null and incomplete envelopes', () => {
        const envelope = {val: 'abc', inc: true, b64: true};
        const table = makeTable({
            columns: ['optional', 'nil', 'envelope'],
            yqlTypes: [
                ['OptionalType', ['DataType', 'String']],
                ['NullType'],
                ['DataType', 'String'],
            ],
            rows: [
                {optional: [[], '0'], nil: [null, '1'], envelope: [envelope, '2']},
                {optional: [['text'], '0'], nil: [null, '1'], envelope: [envelope, '2']},
            ],
        });
        const {data, fallbackColumns} = prepareNavigationPreview(table);
        expect(fallbackColumns).toEqual([]);
        expect(data.rows).toEqual([
            {optional: [], nil: null, envelope},
            {optional: ['text'], nil: null, envelope},
        ]);
        expect(data.columns.map(({type}) => type)).toEqual(table.yqlTypes);
        expect(data.rows[0].envelope).toBe(envelope);
        expect(table.rows[0].optional).toEqual([[], '0']);
    });

    test('keeps raw YSON objects and arrays intact for fallback rendering', () => {
        const value = {$type: 'string', $value: 'abc', $binary: true, $incomplete: true};
        const attributed = {$value: [1, 2], $attributes: {key: 'value'}};
        const table = makeTable({
            columns: ['value', 'list', 'attributed'],
            rows: [{value, list: ['text', '0'], attributed}],
        });
        const {data, fallbackColumns} = prepareNavigationPreview(table);
        expect(fallbackColumns).toEqual(table.columns);
        expect(data.rows).toEqual(table.rows);
        expect(data.rows[0].value).toBe(value);
        expect(data.rows[0].attributed).toBe(attributed);
    });

    test('falls back for differing wire types or mixed raw and typed values', () => {
        const table = makeTable({
            columns: ['different', 'mixed', 'equal'],
            yqlTypes: [
                ['DataType', 'String'],
                ['DataType', 'Int64'],
                ['DataType', 'String'],
            ],
            rows: [
                {different: ['a', '0'], mixed: ['a', '0'], equal: ['a', '0']},
                {different: ['42', '1'], mixed: {$value: 'b'}, equal: ['b', '2']},
            ],
        });
        const {data, fallbackColumns} = prepareNavigationPreview(table);
        expect(fallbackColumns).toEqual(['different', 'mixed']);
        expect(data.rows).toEqual([
            {...table.rows[0], equal: 'a'},
            {...table.rows[1], equal: 'b'},
        ]);
    });

    test('preserves schema order followed by the stable tail without mutating inputs', () => {
        const table = makeTable({
            columns: ['extra-b', 'b', 'extra-a', 'a'],
            schema: [makeSchema('a'), makeSchema('missing'), makeSchema('b')],
        });
        const {data, fallbackColumns} = prepareNavigationPreview(table);
        expect(data.columns.map(({name}) => name)).toEqual(['a', 'b', 'extra-b', 'extra-a']);
        expect(table.columns).toEqual(['extra-b', 'b', 'extra-a', 'a']);
        expect(fallbackColumns).toEqual([]);
        expect(data.rows).toEqual([]);
    });

    test('falls back when cells or all injected schema values are missing', () => {
        const table = makeTable({
            columns: ['partial', 'injected'],
            schema: [makeSchema('partial'), makeSchema('injected')],
            yqlTypes: [['DataType', 'Int64']],
            rows: [{partial: ['42', '0']}, {}],
        });
        const {data, fallbackColumns} = prepareNavigationPreview(table);
        expect(fallbackColumns).toEqual(['partial', 'injected']);
        expect(data.rows).toEqual(table.rows);
        expect(data.rows[1]).not.toHaveProperty('partial');
    });

    test('handles absent data and malformed registry entries', () => {
        expect(prepareNavigationPreview(undefined)).toEqual({
            data: {columns: [], rows: []},
            fallbackColumns: [],
        });
        const table = makeTable({
            columns: ['invalid'],
            rows: [{invalid: ['value', '0']}],
            yqlTypes: [[]],
        });
        expect(prepareNavigationPreview(table).fallbackColumns).toEqual(['invalid']);
    });
});
