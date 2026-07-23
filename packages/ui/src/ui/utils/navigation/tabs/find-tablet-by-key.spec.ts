import {findTabletByKey, isPivotFilter} from './find-tablet-by-key';

type PivotType = 'boolean' | 'double' | 'int64' | 'uint64' | 'string';

const pivot = (type: PivotType, value: string) => ({$type: type, $value: value});
const tablet = (id: string, pivot_key: ReturnType<typeof pivot>[]) => ({id, pivot_key});

describe('isPivotFilter', () => {
    it.each(['[]', '[10]', '[10', '[10, value]', '[10, value'])('recognizes %s', (filter) => {
        expect(isPivotFilter(filter)).toBe(true);
    });

    it('does not recognize a regular text filter', () => {
        expect(isPivotFilter('tablet-id')).toBe(false);
    });
});

describe('findTabletByKey', () => {
    const int64Schema = [{type: 'int64', sort_order: 'ascending'}];
    const tablets = [
        tablet('first', []),
        tablet('second', [pivot('int64', '100')]),
        tablet('third', [pivot('int64', '200')]),
    ];

    it.each([
        ['[50]', 'first'],
        ['[100]', 'second'],
        ['[100', 'second'],
        ['[199]', 'second'],
        ['[200]', 'third'],
        ['[1000]', 'third'],
    ])('finds the tablet serving key %s', (filter, expectedId) => {
        expect(findTabletByKey(filter, tablets, int64Schema)).toEqual([
            expect.objectContaining({id: expectedId}),
        ]);
    });

    it('compares composite keys lexicographically', () => {
        const schema = [
            {type: 'int64', sort_order: 'ascending'},
            {type: 'string', sort_order: 'ascending'},
        ];
        const compositeTablets = [
            tablet('first', []),
            tablet('second', [pivot('int64', '10')]),
            tablet('third', [pivot('int64', '10'), pivot('string', 'm')]),
            tablet('fourth', [pivot('int64', '20')]),
        ];

        expect(findTabletByKey('[10, z]', compositeTablets, schema)).toEqual([
            expect.objectContaining({id: 'third'}),
        ]);
    });

    it('respects descending key columns', () => {
        const schema = [{type: 'int64', sort_order: 'descending'}];
        const descendingTablets = [
            tablet('first', []),
            tablet('second', [pivot('int64', '200')]),
            tablet('third', [pivot('int64', '100')]),
        ];

        expect(findTabletByKey('[150]', descendingTablets, schema)).toEqual([
            expect.objectContaining({id: 'second'}),
        ]);
        expect(findTabletByKey('[100]', descendingTablets, schema)).toEqual([
            expect.objectContaining({id: 'third'}),
        ]);
    });

    it('compares uint64 values without losing precision', () => {
        const schema = [{type: 'uint64', sort_order: 'ascending'}];
        const uint64Tablets = [
            tablet('first', []),
            tablet('second', [pivot('uint64', '553402322211286528')]),
            tablet('third', [pivot('uint64', '737869762948382080')]),
        ];

        expect(findTabletByKey('[553402322211286528u]', uint64Tablets, schema)).toEqual([
            expect.objectContaining({id: 'second'}),
        ]);
    });

    it('does not discard a zero key component', () => {
        expect(findTabletByKey('[0]', tablets, int64Schema)).toEqual([
            expect.objectContaining({id: 'first'}),
        ]);
    });

    it.each(['[-]', '[10, , 20]', '[10, 20]', '[NaN]', '[Infinity]'])(
        'returns no tablet for invalid numeric key %s',
        (filter) => {
            expect(findTabletByKey(filter, tablets, int64Schema)).toEqual([]);
        },
    );

    it.each(['[invalid]', '[1]'])('returns no tablet for invalid boolean key %s', (filter) => {
        const schema = [{type: 'boolean', sort_order: 'ascending'}];
        const booleanTablets = [tablet('first', []), tablet('second', [pivot('boolean', 'true')])];

        expect(findTabletByKey(filter, booleanTablets, schema)).toEqual([]);
    });

    it('accepts valid false boolean key', () => {
        const schema = [{type: 'boolean', sort_order: 'ascending'}];
        const booleanTablets = [tablet('first', []), tablet('second', [pivot('boolean', 'true')])];

        expect(findTabletByKey('[false]', booleanTablets, schema)).toEqual([
            expect.objectContaining({id: 'first'}),
        ]);
    });

    it('returns no tablet for invalid double key', () => {
        const schema = [{type: 'double', sort_order: 'ascending'}];
        const doubleTablets = [tablet('first', []), tablet('second', [pivot('double', '1.5')])];

        expect(findTabletByKey('[NaN]', doubleTablets, schema)).toEqual([]);
    });

    it('returns no tablet when the table has no tablets', () => {
        expect(findTabletByKey('[10]', [], int64Schema)).toEqual([]);
    });
});
