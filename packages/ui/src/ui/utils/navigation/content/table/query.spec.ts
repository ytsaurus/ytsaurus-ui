import {Query} from './query';

// Mock unipika to avoid pulling in the heavy rendering dependency
jest.mock('../../../../common/thor/unipika', () => ({
    formatFromYSON: jest.fn(() => 'yson-value'),
    formatFromYQL: jest.fn(() => 'yql-value'),
}));

import unipika from '../../../../common/thor/unipika';

const unipikaFormatFromYSON = unipika.formatFromYSON as jest.Mock;
const unipikaFormatFromYQL = unipika.formatFromYQL as jest.Mock;

describe('Query.prepareColumns', () => {
    it('returns * when columns array is empty', () => {
        expect(Query.prepareColumns([])).toBe('*');
    });

    it('escapes a single named column', () => {
        expect(Query.prepareColumns([{name: 'id'}])).toBe('[id]');
    });

    it('escapes a single string column (no .name property)', () => {
        expect(Query.prepareColumns(['title'])).toBe('[title]');
    });

    it('joins multiple columns with ", "', () => {
        expect(Query.prepareColumns([{name: 'a'}, {name: 'b'}, {name: 'c'}])).toBe('[a], [b], [c]');
    });

    it('mixes named objects and plain strings', () => {
        expect(Query.prepareColumns([{name: 'id'}, 'name'])).toBe('[id], [name]');
    });
});

describe('Query.prepareColumnValue', () => {
    const YSON_SETTINGS = {
        format: 'yson',
        break: false,
        indent: 0,
        asHTML: false,
        treatValAsData: true,
    };

    beforeEach(() => {
        unipikaFormatFromYSON.mockClear();
        unipikaFormatFromYQL.mockClear();
    });

    it('falls back to formatFromYSON when yqlTypes is absent', () => {
        Query.prepareColumnValue('raw', undefined);
        expect(unipikaFormatFromYSON).toHaveBeenCalledWith('raw', YSON_SETTINGS);
        expect(unipikaFormatFromYQL).not.toHaveBeenCalled();
    });

    it('falls back to formatFromYSON when value is falsy (null)', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Query.prepareColumnValue(null, ['some-type'] as any);
        expect(unipikaFormatFromYSON).toHaveBeenCalledWith(null, YSON_SETTINGS);
        expect(unipikaFormatFromYQL).not.toHaveBeenCalled();
    });

    it('uses formatFromYQL when both value and yqlTypes are present', () => {
        const value = ['data', 1];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const yqlTypes = ['type0', 'type1'] as any;
        Query.prepareColumnValue(value, yqlTypes);
        expect(unipikaFormatFromYQL).toHaveBeenCalledWith(['data', 'type1'], YSON_SETTINGS);
        expect(unipikaFormatFromYSON).not.toHaveBeenCalled();
    });

    it('returns the mocked yson-value string from formatFromYSON', () => {
        const result = Query.prepareColumnValue('x', undefined);
        expect(result).toBe('yson-value');
    });

    it('returns the mocked yql-value string from formatFromYQL', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = Query.prepareColumnValue(['d', 0], ['typeA'] as any);
        expect(result).toBe('yql-value');
    });
});

describe('Query.prepareKey', () => {
    beforeEach(() => {
        unipikaFormatFromYSON.mockClear();
    });

    it('returns empty string for an empty key', () => {
        expect(Query.prepareKey([], undefined)).toBe('');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(Query.prepareKey(null as any, undefined)).toBe('');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(Query.prepareKey(undefined as any, undefined)).toBe('');
    });

    it('wraps a single string value in parentheses without re-formatting', () => {
        expect(Query.prepareKey(['hello'], undefined)).toBe('(hello)');
    });

    it('formats non-string values through prepareColumnValue', () => {
        // non-string triggers prepareColumnValue → formatFromYSON → 'yson-value'
        const result = Query.prepareKey([42], undefined);
        expect(result).toBe('(yson-value)');
        expect(unipikaFormatFromYSON).toHaveBeenCalledTimes(1);
    });

    it('joins multiple values with ", "', () => {
        const result = Query.prepareKey(['a', 'b'], undefined);
        expect(result).toBe('(a, b)');
    });
});

describe('Query.prepareWhere', () => {
    const offsetKey = '(10, 20)';

    it('uses >= for ascending order', () => {
        const result = Query.prepareWhere(['pk'], offsetKey, 'gq');
        expect(result).toBe('([pk]) >= (10, 20)');
    });

    it('uses <= for descending order', () => {
        const result = Query.prepareWhere(['pk'], offsetKey, 'lq');
        expect(result).toBe('([pk]) <= (10, 20)');
    });

    it('escapes multiple offset columns', () => {
        const result = Query.prepareWhere(['a', 'b'], offsetKey, 'gq');
        expect(result).toBe('([a], [b]) >= (10, 20)');
    });
});

describe('Query.prepareOrder', () => {
    it('produces ASC order by default', () => {
        const result = Query.prepareOrder(['id'], false);
        expect(result).toBe('[id] ASC');
    });

    it('produces DESC order when descending=true', () => {
        const result = Query.prepareOrder(['id'], true);
        expect(result).toBe('[id] DESC');
    });

    it('joins multiple key columns with ", "', () => {
        const result = Query.prepareOrder(['a', 'b'], false);
        expect(result).toBe('[a] ASC, [b] ASC');
    });
});

describe('Query.prepareQuery', () => {
    // Base params without offset — matches the {offset?: never} branch of QueryOffsetParameters
    const baseParams = {
        path: '//home/test',
        columns: [{name: 'id'}, {name: 'ts'}, {name: 'name'}],
        keyColumns: ['id', 'ts'],
        limit: 100,
        orderBySupported: false,
        descending: false,
    };

    // Offset params — matches the {offset, offsetColumns} branch
    const offsetParams = {
        ...baseParams,
        offsetColumns: ['id', 'ts'],
        offset: '(5, 42)',
    };

    it('builds a simple SELECT without WHERE or ORDER BY', () => {
        const result = Query.prepareQuery(baseParams);
        expect(result).toBe('[id], [ts], [name] FROM [//home/test] LIMIT 100');
    });

    it('includes ORDER BY with multiple key columns when orderBySupported=true', () => {
        const result = Query.prepareQuery({...baseParams, orderBySupported: true});
        expect(result).toBe(
            '[id], [ts], [name] FROM [//home/test] ORDER BY [id] ASC, [ts] ASC LIMIT 100',
        );
    });

    it('includes WHERE clause with multiple offset columns when offset is provided', () => {
        const result = Query.prepareQuery(offsetParams);
        expect(result).toBe(
            '[id], [ts], [name] FROM [//home/test] WHERE ([id], [ts]) >= (5, 42) LIMIT 100',
        );
    });

    it('includes both WHERE and ORDER BY with multiple columns when both are applicable', () => {
        const result = Query.prepareQuery({...offsetParams, orderBySupported: true});
        expect(result).toBe(
            '[id], [ts], [name] FROM [//home/test] WHERE ([id], [ts]) >= (5, 42) ORDER BY [id] ASC, [ts] ASC LIMIT 100',
        );
    });

    it('uses DESC in WHERE and ORDER BY with multiple columns when descending=true', () => {
        const result = Query.prepareQuery({
            ...offsetParams,
            orderBySupported: true,
            descending: true,
        });
        expect(result).toBe(
            '[id], [ts], [name] FROM [//home/test] WHERE ([id], [ts]) <= (5, 42) ORDER BY [id] DESC, [ts] DESC LIMIT 100',
        );
    });

    it('defaults descending to false when not provided', () => {
        const {descending: _omit, ...params} = baseParams;
        const result = Query.prepareQuery({...params, orderBySupported: true});
        expect(result).toContain('ASC');
        expect(result).not.toContain('DESC');
    });

    it('uses * when columns is empty', () => {
        const result = Query.prepareQuery({...baseParams, columns: []});
        expect(result).toMatch(/^\*/);
    });
});
