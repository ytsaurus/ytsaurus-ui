// @ts-ignore
import unipika from '@gravity-ui/unipika/lib/unipika';
import {FlattenUnipikaResult, UnipikaFlattenTree, flattenUnipika} from './flattenUnipika';

describe('flattenUnipika', () => {
    describe('YSON', () => {
        describe('YSON without attributes', () => {
            it('null', () => {
                const converted = unipika.converters.raw(null);
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$value: null, $type: 'null'},
                    },
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('number', () => {
                const converted = unipika.converters.raw(123);
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$type: 'number', $value: 123},
                    },
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('string', () => {
                const converted = unipika.converters.raw('hello');
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$value: 'hello', $type: 'string'},
                    },
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('boolean', () => {
                const converted = unipika.converters.raw(true);
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$value: true, $type: 'boolean'},
                    },
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list', () => {
                const converted = unipika.converters.raw([1, 2, 'three']);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: {$type: 'number', $value: 1},
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        value: {$type: 'number', $value: 2},
                        hasDelimiter: true,
                    },
                    {level: 1, value: {$type: 'string', $value: 'three'}},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map', () => {
                const converted = unipika.converters.raw({
                    a: 'A',
                    b: 'B',
                    c: 'C',
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: {$key: true, $value: 'a', $type: 'string'},
                        value: {$value: 'A', $type: 'string'},
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        key: {$key: true, $value: 'b', $type: 'string'},
                        value: {$value: 'B', $type: 'string'},
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        key: {$key: true, $value: 'c', $type: 'string'},
                        value: {$value: 'C', $type: 'string'},
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> map -> list', () => {
                const converted = unipika.converters.raw([
                    'a',
                    {
                        b: 'B',
                        c: [1, 2],
                    },
                ]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: {$type: 'string', $value: 'a'},
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'object', path: '1'},
                    {
                        level: 2,
                        key: {$key: true, $value: 'b', $type: 'string'},
                        value: {$type: 'string', $value: 'B'},
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: {$key: true, $value: 'c', $type: 'string'},
                        open: 'array',
                        path: '1/c',
                    },
                    {
                        level: 3,
                        value: {$type: 'number', $value: 1},
                        hasDelimiter: true,
                    },
                    {level: 3, value: {$type: 'number', $value: 2}},
                    {level: 2, close: 'array'},
                    {level: 1, close: 'object'},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> list -> list', () => {
                const converted = unipika.converters.raw([1, [2, [3, 4], 5], 6]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: makeRawValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'array', path: '1'},
                    {
                        level: 2,
                        value: makeRawValue(2, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 2, open: 'array', path: '1/1'},
                    {
                        level: 3,
                        value: makeRawValue(3, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 3, value: makeRawValue(4, 'number')},
                    {level: 2, close: 'array', hasDelimiter: true},
                    {level: 2, value: makeRawValue(5, 'number')},
                    {level: 1, close: 'array', hasDelimiter: true},
                    {level: 1, value: makeRawValue(6, 'number')},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map -> list -> map', () => {
                const converted = unipika.converters.yson({
                    a: 'A',
                    b: [
                        'C',
                        {
                            e: 'E',
                        },
                        'F',
                    ],
                    g: 'G',
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('a'),
                        value: makeValue('A', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 1, key: makeKey('b'), open: 'array', path: 'b'},
                    {
                        level: 2,
                        value: makeValue('C', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 2, open: 'object', path: 'b/1'},
                    {
                        level: 3,
                        key: makeKey('e'),
                        value: makeValue('E', 'string'),
                    },
                    {level: 2, close: 'object', hasDelimiter: true},
                    {level: 2, value: makeValue('F', 'string')},
                    {level: 1, close: 'array', hasDelimiter: true},
                    {
                        level: 1,
                        key: makeKey('g'),
                        value: makeValue('G', 'string'),
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map -> map -> map', () => {
                const converted = unipika.converters.raw({
                    a: 'A',
                    b: {
                        c: 'C',
                        d: {
                            e: 'E',
                        },
                        f: 'F',
                    },
                    g: 'G',
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeRawKey('a'),
                        value: makeRawValue('A', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        key: makeRawKey('b'),
                        open: 'object',
                        path: 'b',
                    },
                    {
                        level: 2,
                        key: makeRawKey('c'),
                        value: makeRawValue('C', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeRawKey('d'),
                        open: 'object',
                        path: 'b/d',
                    },
                    {
                        level: 3,
                        key: makeRawKey('e'),
                        value: makeRawValue('E', 'string'),
                    },
                    {level: 2, close: 'object', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeRawKey('f'),
                        value: makeRawValue('F', 'string'),
                    },
                    {level: 1, close: 'object', hasDelimiter: true},
                    {
                        level: 1,
                        key: makeRawKey('g'),
                        value: makeRawValue('G', 'string'),
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
        });

        describe('YSON with attributes', () => {
            it('null with attributes', () => {
                const converted = unipika.converters.yson({
                    $value: null,
                    $attributes: {a: 'A'},
                });
                const expected: UnipikaFlattenTree = [
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('a'),
                        value: makeValue('A', 'string'),
                    },
                    {level: 1, close: 'attributes'},
                    {
                        level: 1,
                        value: makeValue(null, 'null'),
                        isAfterAttributes: true,
                    },
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('number with deep attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {
                        schema: {
                            $attributes: {
                                columns: {
                                    $value: ['a', 'b'],
                                },
                                writeable: false,
                            },
                            $value: [1, 2],
                        },
                        rowCount: 22,
                    },
                    $value: 123,
                });
                const expected: UnipikaFlattenTree = [
                    {level: 1, open: 'attributes', path: '@'},
                    {level: 2, key: makeKey('schema'), path: '@/schema'},
                    {level: 3, open: 'attributes', path: '@/schema/@'},
                    {
                        level: 4,
                        open: 'array',
                        key: makeKey('columns'),
                        path: '@/schema/@/columns',
                    },
                    {
                        level: 5,
                        value: makeValue('a', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 5, value: makeValue('b', 'string')},
                    {level: 4, close: 'array', hasDelimiter: true},
                    {
                        level: 4,
                        key: makeKey('writeable'),
                        value: makeValue(false, 'boolean'),
                    },
                    {level: 3, close: 'attributes'},
                    {
                        level: 3,
                        open: 'array',
                        isAfterAttributes: true,
                        path: '@/schema/$',
                    },
                    {
                        level: 4,
                        value: makeValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 4, value: makeValue(2, 'number')},
                    {level: 3, close: 'array', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeKey('rowCount'),
                        value: makeValue(22, 'number'),
                    },
                    {level: 1, close: 'attributes'},
                    {
                        level: 1,
                        value: makeValue(123, 'number'),
                        isAfterAttributes: true,
                    },
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('array with attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {attr1: 'Attr1'},
                    $value: [
                        {
                            $attributes: {attr2: 'Attr2'},
                            $value: ['test', ['result', 42]],
                        },
                        'foo',
                    ],
                });

                const expected: UnipikaFlattenTree = [
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('attr1'),
                        value: makeValue('Attr1', 'string'),
                    },
                    {level: 1, close: 'attributes'},
                    {
                        level: 1,
                        open: 'array',
                        isAfterAttributes: true,
                        path: '$',
                    },
                    {level: 2, open: 'attributes', path: '$/0/@'},
                    {
                        level: 3,
                        key: makeKey('attr2'),
                        value: makeValue('Attr2', 'string'),
                    },
                    {level: 2, close: 'attributes'},
                    {
                        level: 2,
                        open: 'array',
                        isAfterAttributes: true,
                        path: '$/0/$',
                    },
                    {
                        level: 3,
                        value: makeValue('test', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 3, open: 'array', path: '$/0/$/1'},
                    {
                        level: 4,
                        value: makeValue('result', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 4, value: makeValue(42, 'number')},
                    {level: 3, close: 'array'},
                    {level: 2, close: 'array', hasDelimiter: true},
                    {level: 2, value: makeValue('foo', 'string')},
                    {level: 1, close: 'array'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it("a map's expandable field with attributes", () => {
                const converted = unipika.converters.yson({
                    a: {
                        $attributes: {b: 'B'},
                        $value: 'C',
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {level: 1, key: makeKey('a'), path: 'a'},
                    {level: 2, open: 'attributes', path: 'a/@'},
                    {
                        level: 3,
                        key: makeKey('b'),
                        value: makeValue('B', 'string'),
                    },
                    {level: 2, close: 'attributes'},
                    {
                        level: 2,
                        value: makeValue('C', 'string'),
                        isAfterAttributes: true,
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map with attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {attr2: false, attr3: 'Attr3'},
                    $value: {
                        a: 'test',
                        b: {
                            $attributes: {attr3: 'Attr3'},
                            $value: {
                                c: 'C',
                                d: {
                                    $attributes: {attr4: 'Attr4'},
                                    $value: {e: 'E', f: 'F'},
                                },
                                g: 'G',
                            },
                        },
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('attr2'),
                        value: makeValue(false, 'boolean'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('attr3'),
                        value: makeValue('Attr3', 'string'),
                    },
                    {level: 1, close: 'attributes'},
                    {
                        level: 1,
                        open: 'object',
                        isAfterAttributes: true,
                        path: '$',
                    },
                    {
                        level: 2,
                        key: makeKey('a'),
                        value: makeValue('test', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 2, key: makeKey('b'), path: '$/b'},
                    {level: 3, open: 'attributes', path: '$/b/@'},
                    {
                        level: 4,
                        key: makeKey('attr3'),
                        value: makeValue('Attr3', 'string'),
                    },
                    {level: 3, close: 'attributes'},
                    {
                        level: 3,
                        open: 'object',
                        isAfterAttributes: true,
                        path: '$/b/$',
                    },
                    {
                        level: 4,
                        key: makeKey('c'),
                        value: makeValue('C', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 4, key: makeKey('d'), path: '$/b/$/d'},
                    {level: 5, open: 'attributes', path: '$/b/$/d/@'},
                    {
                        level: 6,
                        key: makeKey('attr4'),
                        value: makeValue('Attr4', 'string'),
                    },
                    {level: 5, close: 'attributes'},
                    {
                        level: 5,
                        open: 'object',
                        isAfterAttributes: true,
                        path: '$/b/$/d/$',
                    },
                    {
                        level: 6,
                        key: makeKey('e'),
                        value: makeValue('E', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 6,
                        key: makeKey('f'),
                        value: makeValue('F', 'string'),
                    },
                    {level: 5, close: 'object', hasDelimiter: true},
                    {
                        level: 4,
                        key: makeKey('g'),
                        value: makeValue('G', 'string'),
                    },
                    {level: 3, close: 'object'},
                    {level: 1, close: 'object'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
        });

        describe('YSON light containers', () => {
            it('empty list', () => {
                const converted = unipika.converters.yson([]);
                const expected: UnipikaFlattenTree = [{level: 0, open: 'array', close: 'array'}];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('empty list -> empty list', () => {
                const converted = unipika.converters.yson([[]]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {level: 1, open: 'array', close: 'array'},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('empty map', () => {
                const converted = unipika.converters.yson({});
                const expected: UnipikaFlattenTree = [{level: 0, open: 'object', close: 'object'}];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> empty map', () => {
                const converted = unipika.converters.yson([{}]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {level: 1, open: 'object', close: 'object'},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map -> empty list', () => {
                const converted = unipika.converters.yson({a: []});
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('a'),
                        open: 'array',
                        close: 'array',
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted)).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
        });
    });

    describe('JSON', () => {
        describe('JSON without attributes', () => {
            it('null', () => {
                const converted = unipika.converters.raw(null);
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$value: null, $type: 'null'},
                    },
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('number', () => {
                const converted = unipika.converters.raw(123);
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$type: 'number', $value: 123},
                    },
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('string', () => {
                const converted = unipika.converters.raw('hello');
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$value: 'hello', $type: 'string'},
                    },
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('boolean', () => {
                const converted = unipika.converters.raw(true);
                const expected: UnipikaFlattenTree = [
                    {
                        level: 0,
                        value: {$value: true, $type: 'boolean'},
                    },
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list', () => {
                const converted = unipika.converters.raw([1, 2, 'three']);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: {$type: 'number', $value: 1},
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        value: {$type: 'number', $value: 2},
                        hasDelimiter: true,
                    },
                    {level: 1, value: {$type: 'string', $value: 'three'}},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map', () => {
                const converted = unipika.converters.raw({
                    a: 'A',
                    b: 'B',
                    c: 'C',
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: {$key: true, $value: 'a', $type: 'string'},
                        value: {$value: 'A', $type: 'string'},
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        key: {$key: true, $value: 'b', $type: 'string'},
                        value: {$value: 'B', $type: 'string'},
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        key: {$key: true, $value: 'c', $type: 'string'},
                        value: {$value: 'C', $type: 'string'},
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> map -> list', () => {
                const converted = unipika.converters.raw([
                    'a',
                    {
                        b: 'B',
                        c: [1, 2],
                    },
                ]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: {$type: 'string', $value: 'a'},
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'object', path: '1'},
                    {
                        level: 2,
                        key: {$key: true, $value: 'b', $type: 'string'},
                        value: {$type: 'string', $value: 'B'},
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: {$key: true, $value: 'c', $type: 'string'},
                        open: 'array',
                        path: '1/c',
                    },
                    {
                        level: 3,
                        value: {$type: 'number', $value: 1},
                        hasDelimiter: true,
                    },
                    {level: 3, value: {$type: 'number', $value: 2}},
                    {level: 2, close: 'array'},
                    {level: 1, close: 'object'},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> list -> list', () => {
                const converted = unipika.converters.raw([1, [2, [3, 4], 5], 6]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: makeRawValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'array', path: '1'},
                    {
                        level: 2,
                        value: makeRawValue(2, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 2, open: 'array', path: '1/1'},
                    {
                        level: 3,
                        value: makeRawValue(3, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 3, value: makeRawValue(4, 'number')},
                    {level: 2, close: 'array', hasDelimiter: true},
                    {level: 2, value: makeRawValue(5, 'number')},
                    {level: 1, close: 'array', hasDelimiter: true},
                    {level: 1, value: makeRawValue(6, 'number')},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map -> list -> map', () => {
                const converted = unipika.converters.yson({
                    a: 'A',
                    b: [
                        'C',
                        {
                            e: 'E',
                        },
                        'F',
                    ],
                    g: 'G',
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('a'),
                        value: makeValue('A', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 1, key: makeKey('b'), open: 'array', path: 'b'},
                    {
                        level: 2,
                        value: makeValue('C', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 2, open: 'object', path: 'b/1'},
                    {
                        level: 3,
                        key: makeKey('e'),
                        value: makeValue('E', 'string'),
                    },
                    {level: 2, close: 'object', hasDelimiter: true},
                    {level: 2, value: makeValue('F', 'string')},
                    {level: 1, close: 'array', hasDelimiter: true},
                    {
                        level: 1,
                        key: makeKey('g'),
                        value: makeValue('G', 'string'),
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map -> map -> map', () => {
                const converted = unipika.converters.raw({
                    a: 'A',
                    b: {
                        c: 'C',
                        d: {
                            e: 'E',
                        },
                        f: 'F',
                    },
                    g: 'G',
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeRawKey('a'),
                        value: makeRawValue('A', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        key: makeRawKey('b'),
                        open: 'object',
                        path: 'b',
                    },
                    {
                        level: 2,
                        key: makeRawKey('c'),
                        value: makeRawValue('C', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeRawKey('d'),
                        open: 'object',
                        path: 'b/d',
                    },
                    {
                        level: 3,
                        key: makeRawKey('e'),
                        value: makeRawValue('E', 'string'),
                    },
                    {level: 2, close: 'object', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeRawKey('f'),
                        value: makeRawValue('F', 'string'),
                    },
                    {level: 1, close: 'object', hasDelimiter: true},
                    {
                        level: 1,
                        key: makeRawKey('g'),
                        value: makeRawValue('G', 'string'),
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
        });

        describe('JSON with attributes', () => {
            it('null with attributes', () => {
                const converted = unipika.converters.yson({
                    $value: null,
                    $attributes: {a: 'A'},
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'attributes-value'},
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('a'),
                        value: makeValue('A', 'string'),
                    },
                    {level: 1, close: 'attributes', hasDelimiter: true},
                    {
                        level: 1,
                        value: makeValue(null, 'null'),
                        isAfterAttributes: true,
                    },
                    {level: 0, close: 'attributes-value'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('number with deep attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {
                        schema: {
                            $attributes: {
                                columns: {
                                    $value: ['a', 'b'],
                                },
                                writeable: false,
                            },
                            $value: [1, 2],
                        },
                        rowCount: 22,
                    },
                    $value: 123,
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'attributes-value'},
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('schema'),
                        open: 'attributes-value',
                        path: '@/schema',
                    },
                    {level: 3, open: 'attributes', path: '@/schema/@'},
                    {
                        level: 4,
                        key: makeKey('columns'),
                        open: 'array',
                        path: '@/schema/@/columns',
                    },
                    {
                        level: 5,
                        value: makeValue('a', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 5, value: makeValue('b', 'string')},
                    {level: 4, close: 'array', hasDelimiter: true},
                    {
                        level: 4,
                        key: makeKey('writeable'),
                        value: makeValue(false, 'boolean'),
                    },
                    {level: 3, close: 'attributes', hasDelimiter: true},
                    {
                        level: 3,
                        open: 'array',
                        isAfterAttributes: true,
                        path: '@/schema/$',
                    },
                    {
                        level: 4,
                        value: makeValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 4, value: makeValue(2, 'number')},
                    {level: 3, close: 'array'},
                    {level: 2, close: 'attributes-value', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeKey('rowCount'),
                        value: makeValue(22, 'number'),
                    },
                    {level: 1, close: 'attributes', hasDelimiter: true},
                    {
                        level: 1,
                        value: makeValue(123, 'number'),
                        isAfterAttributes: true,
                    },
                    {level: 0, close: 'attributes-value'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('array with attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {
                        attr1: 'Attr1',
                        attr2: [
                            1,
                            {
                                $attributes: {
                                    a: 'A',
                                    b: 'B',
                                },
                                $value: [2, 3, 4],
                            },
                        ],
                        q: 42,
                    },
                    $value: [
                        {
                            $attributes: {attr3: 'Attr3'},
                            $value: 'test',
                        },
                    ],
                });

                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'attributes-value'},
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('attr1'),
                        value: makeValue('Attr1', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        open: 'array',
                        key: makeKey('attr2'),
                        path: '@/attr2',
                    },
                    {
                        level: 3,
                        value: makeValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 3, open: 'attributes-value', path: '@/attr2/1'},
                    {level: 4, open: 'attributes', path: '@/attr2/1/@'},
                    {
                        level: 5,
                        key: makeKey('a'),
                        value: makeValue('A', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 5,
                        key: makeKey('b'),
                        value: makeValue('B', 'string'),
                    },
                    {level: 4, close: 'attributes', hasDelimiter: true},
                    {
                        level: 4,
                        open: 'array',
                        path: '@/attr2/1/$',
                        isAfterAttributes: true,
                    },
                    {
                        level: 5,
                        value: makeValue(2, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 5,
                        value: makeValue(3, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 5, value: makeValue(4, 'number')},
                    {level: 4, close: 'array'},
                    {level: 3, close: 'attributes-value'},
                    {level: 2, close: 'array', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeKey('q'),
                        value: makeValue(42, 'number'),
                    },
                    {level: 1, close: 'attributes', hasDelimiter: true},
                    {
                        level: 1,
                        open: 'array',
                        isAfterAttributes: true,
                        path: '$',
                    },
                    {level: 2, open: 'attributes-value', path: '$/0'},
                    {level: 3, open: 'attributes', path: '$/0/@'},
                    {
                        level: 4,
                        key: makeKey('attr3'),
                        value: makeValue('Attr3', 'string'),
                    },
                    {level: 3, close: 'attributes', hasDelimiter: true},
                    {
                        level: 3,
                        value: makeValue('test', 'string'),
                        isAfterAttributes: true,
                    },
                    {level: 2, close: 'attributes-value'},
                    {level: 1, close: 'array'},
                    {level: 0, close: 'attributes-value'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map with attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {
                        attr2: false,
                        attr3: {
                            $attributes: {
                                foo: 'bar',
                            },
                            $value: 'Attr3',
                        },
                        attr4: 100,
                    },
                    $value: {
                        a: 'test',
                        b: {
                            $attributes: {
                                attr3: 'Attr3',
                            },
                            $value: {
                                c: 'C',
                            },
                        },
                        d: 'D',
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'attributes-value'},
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('attr2'),
                        value: makeValue(false, 'boolean'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('attr3'),
                        open: 'attributes-value',
                        path: '@/attr3',
                    },
                    {level: 3, open: 'attributes', path: '@/attr3/@'},
                    {
                        level: 4,
                        key: makeKey('foo'),
                        value: makeValue('bar', 'string'),
                    },
                    {level: 3, close: 'attributes', hasDelimiter: true},
                    {
                        level: 3,
                        value: makeValue('Attr3', 'string'),
                        isAfterAttributes: true,
                    },
                    {level: 2, close: 'attributes-value', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeKey('attr4'),
                        value: makeValue(100, 'number'),
                    },
                    {level: 1, close: 'attributes', hasDelimiter: true},
                    {
                        level: 1,
                        open: 'object',
                        isAfterAttributes: true,
                        path: '$',
                    },
                    {
                        level: 2,
                        key: makeKey('a'),
                        value: makeValue('test', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('b'),
                        open: 'attributes-value',
                        path: '$/b',
                    },
                    {level: 3, open: 'attributes', path: '$/b/@'},
                    {
                        level: 4,
                        key: makeKey('attr3'),
                        value: makeValue('Attr3', 'string'),
                    },
                    {level: 3, close: 'attributes', hasDelimiter: true},
                    {
                        level: 3,
                        open: 'object',
                        isAfterAttributes: true,
                        path: '$/b/$',
                    },
                    {
                        level: 4,
                        key: makeKey('c'),
                        value: makeValue('C', 'string'),
                    },
                    {level: 3, close: 'object'},
                    {level: 2, close: 'attributes-value', hasDelimiter: true},
                    {
                        level: 2,
                        key: makeKey('d'),
                        value: makeValue('D', 'string'),
                    },
                    {level: 1, close: 'object'},
                    {level: 0, close: 'attributes-value'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it("a map's expandable field with attributes", () => {
                const converted = unipika.converters.yson({
                    a: {
                        $attributes: {b: 'B'},
                        $value: 'C',
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('a'),
                        open: 'attributes-value',
                        path: 'a',
                    },
                    {level: 2, open: 'attributes', path: 'a/@'},
                    {
                        level: 3,
                        key: makeKey('b'),
                        value: makeValue('B', 'string'),
                    },
                    {level: 2, close: 'attributes', hasDelimiter: true},
                    {
                        level: 2,
                        value: makeValue('C', 'string'),
                        isAfterAttributes: true,
                    },
                    {level: 1, close: 'attributes-value'},
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
        });

        describe('JSON light containers', () => {
            it('empty list', () => {
                const converted = unipika.converters.yson([]);
                const expected: UnipikaFlattenTree = [{level: 0, open: 'array', close: 'array'}];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> empty list', () => {
                const converted = unipika.converters.yson([[]]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {level: 1, open: 'array', close: 'array'},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('empty map', () => {
                const converted = unipika.converters.yson({});
                const expected: UnipikaFlattenTree = [{level: 0, open: 'object', close: 'object'}];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('list -> empty map', () => {
                const converted = unipika.converters.yson([{}]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {level: 1, open: 'object', close: 'object'},
                    {level: 0, close: 'array'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
            it('map -> empty list', () => {
                const converted = unipika.converters.yson({a: []});
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('a'),
                        open: 'array',
                        close: 'array',
                    },
                    {level: 0, close: 'object'},
                ];
                expect(flattenUnipika(converted, {isJson: true})).toEqual({
                    data: expected,
                    searchIndex: {},
                });
            });
        });
    });

    describe('With collapsedState', () => {
        describe('YSON', () => {
            it('list -> list -> list with collapsedState', () => {
                const converted = unipika.converters.yson([
                    1,
                    [2, [3, 4], 5],
                    6,
                    {
                        $attributes: {a: 'A', b: 'B'},
                        $value: [7, [8, 9], 10],
                    },
                ]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: makeValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'array', path: '1'},
                    {
                        level: 2,
                        value: makeValue(2, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        open: 'array',
                        path: '1/1',
                        collapsed: true,
                        close: 'array',
                        hasDelimiter: true,
                    },
                    {level: 2, value: makeValue(5, 'number')},
                    {level: 1, close: 'array', hasDelimiter: true},
                    {
                        level: 1,
                        value: makeValue(6, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        open: 'array',
                        path: '3',
                        collapsed: true,
                        close: 'array',
                    },
                    {level: 0, close: 'array'},
                ];
                const result = flattenUnipika(converted, {
                    collapsedState: {
                        '1/1': true,
                        '3': true,
                    },
                });
                expect(result).toEqual({data: expected, searchIndex: {}});
            });
            it('list -> map -> list with collapsedState', () => {
                const converted = unipika.converters.yson([
                    'a',
                    {
                        b: 'B',
                        c: [1, 2],
                        z: 'Z',
                    },
                    {
                        $attributes: {columns: ['col1', 'col2']},
                        $value: {
                            d: 'd',
                            f: [3, 4],
                        },
                    },
                ]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: makeValue('a', 'string'),
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'object', path: '1'},
                    {
                        level: 2,
                        key: makeKey('b'),
                        value: makeValue('B', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('c'),
                        open: 'array',
                        path: '1/c',
                        collapsed: true,
                        close: 'array',
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('z'),
                        value: makeValue('Z', 'string'),
                    },
                    {level: 1, close: 'object', hasDelimiter: true},
                    {
                        level: 1,
                        open: 'object',
                        path: '2',
                        collapsed: true,
                        close: 'object',
                    },
                    {level: 0, close: 'array'},
                ];
                const result = flattenUnipika(converted, {
                    collapsedState: {
                        '1/c': true,
                        '2': true,
                    },
                });
                expect(result).toEqual({data: expected, searchIndex: {}});
            });

            it('list -> collapsed item with attribute', () => {
                const converted = unipika.converters.yson([
                    {
                        $attributes: {a: 'A'},
                        $value: 'B',
                    },
                    1,
                ]);
                const expected = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        open: 'attributes-value',
                        close: 'attributes-value',
                        collapsed: true,
                        hasDelimiter: true,
                        path: '0',
                    },
                    {level: 1, value: makeValue(1, 'number')},
                    {level: 0, close: 'array'},
                ];
                const result = flattenUnipika(converted, {
                    collapsedState: {
                        '0': true,
                    },
                });
                expect(result).toEqual({data: expected, searchIndex: {}});
            });

            // TODO: it.todo('Collapsed values');
        });

        describe('JSON', () => {
            it('list -> list -> list with collapsedState', () => {
                const converted = unipika.converters.yson([
                    1,
                    [2, [3, 4], 5],
                    6,
                    {
                        $attributes: {a: 'A', b: 'B'},
                        $value: [7, [8, 9], 10],
                    },
                ]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: makeValue(1, 'number'),
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'array', path: '1'},
                    {
                        level: 2,
                        value: makeValue(2, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        open: 'array',
                        path: '1/1',
                        collapsed: true,
                        close: 'array',
                        hasDelimiter: true,
                    },
                    {level: 2, value: makeValue(5, 'number')},
                    {level: 1, close: 'array', hasDelimiter: true},
                    {
                        level: 1,
                        value: makeValue(6, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        open: 'array',
                        path: '3',
                        collapsed: true,
                        close: 'array',
                    },
                    {level: 0, close: 'array'},
                ];
                const result = flattenUnipika(converted, {
                    isJson: true,
                    collapsedState: {
                        '1/1': true,
                        '3': true,
                    },
                });
                expect(result).toEqual({data: expected, searchIndex: {}});
            });
            it('list -> map -> list with collapsedState', () => {
                const converted = unipika.converters.raw([
                    'a',
                    {
                        b: 'B',
                        c: [1, 2],
                        z: 'Z',
                    },
                    {
                        $attributes: {columns: ['col1', 'col2']},
                        $value: {
                            d: 'd',
                            f: [3, 4],
                        },
                    },
                ]);
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        value: {$type: 'string', $value: 'a'},
                        hasDelimiter: true,
                    },
                    {level: 1, open: 'object', path: '1'},
                    {
                        level: 2,
                        key: {$key: true, $value: 'b', $type: 'string'},
                        value: {$type: 'string', $value: 'B'},
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: {$key: true, $value: 'c', $type: 'string'},
                        open: 'array',
                        path: '1/c',
                        collapsed: true,
                        close: 'array',
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeRawKey('z'),
                        value: makeRawValue('Z', 'string'),
                    },
                    {level: 1, close: 'object', hasDelimiter: true},
                    {
                        level: 1,
                        open: 'object',
                        path: '2',
                        collapsed: true,
                        close: 'object',
                    },
                    {level: 0, close: 'array'},
                ];
                const result = flattenUnipika(converted, {
                    isJson: true,
                    collapsedState: {
                        '1/c': true,
                        '2': true,
                    },
                });
                expect(result).toEqual({data: expected, searchIndex: {}});
            });

            it('list -> collapsed item with attribute', () => {
                const converted = unipika.converters.yson([
                    {
                        $attributes: {a: 'A'},
                        $value: 'B',
                    },
                    1,
                ]);
                const expected = [
                    {level: 0, open: 'array'},
                    {
                        level: 1,
                        open: 'attributes-value',
                        close: 'attributes-value',
                        collapsed: true,
                        hasDelimiter: true,
                        path: '0',
                    },
                    {level: 1, value: makeValue(1, 'number')},
                    {level: 0, close: 'array'},
                ];
                const result = flattenUnipika(converted, {
                    collapsedState: {
                        '0': true,
                    },
                });
                expect(result).toEqual({data: expected, searchIndex: {}});
            });

            it('null with collapsed attributes', () => {
                const converted = unipika.converters.yson({
                    $attributes: {
                        values: [1, {a: 1}, 3],
                    },
                    $value: null,
                });
                const result = flattenUnipika(converted, {
                    isJson: true,
                    collapsedState: {
                        '@': true,
                        '@/2': true,
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'attributes-value'},
                    {
                        level: 1,
                        open: 'attributes',
                        collapsed: true,
                        path: '@',
                        close: 'attributes',
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        value: makeValue(null, 'null'),
                        isAfterAttributes: true,
                    },
                    {level: 0, close: 'attributes-value'},
                ];
                expect(result).toEqual({data: expected, searchIndex: {}});
            });

            it('collapsed attributes', () => {
                const converted = unipika.converters.yson([
                    {
                        $attributes: {
                            columns: ['col1', 'col2'],
                            data: {
                                a: {
                                    $attributes: {test: 123},
                                    $value: 1,
                                },
                                b: {a: 1},
                                c: [100, 200],
                            },
                        },
                        $value: null,
                    },
                    {
                        $attributes: {value: [1, {c: 1}, 3]},
                        $value: null,
                    },
                ]);
                const result = flattenUnipika(converted, {
                    isJson: true,
                    collapsedState: {
                        '0/@/columns': true,
                        '0/@/data/a/@': true,
                        '0/@/data/b': true,
                        '0/@/data/c': true,
                        '1/@': true,
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'array'},
                    {level: 1, open: 'attributes-value', path: '0'},
                    {level: 2, open: 'attributes', path: '0/@'},
                    {
                        level: 3,
                        open: 'array',
                        key: makeKey('columns'),
                        collapsed: true,
                        path: '0/@/columns',
                        close: 'array',
                        hasDelimiter: true,
                    },
                    {
                        level: 3,
                        open: 'object',
                        key: makeKey('data'),
                        path: '0/@/data',
                    },

                    {
                        level: 4,
                        key: makeKey('a'),
                        open: 'attributes-value',
                        path: '0/@/data/a',
                    },
                    {
                        level: 5,
                        open: 'attributes',
                        path: '0/@/data/a/@',
                        collapsed: true,
                        close: 'attributes',
                        hasDelimiter: true,
                    },
                    {
                        level: 5,
                        value: makeValue(1, 'number'),
                        isAfterAttributes: true,
                    },
                    {level: 4, close: 'attributes-value', hasDelimiter: true},

                    {
                        level: 4,
                        open: 'object',
                        key: makeKey('b'),
                        collapsed: true,
                        path: '0/@/data/b',
                        close: 'object',
                        hasDelimiter: true,
                    },
                    {
                        level: 4,
                        open: 'array',
                        key: makeKey('c'),
                        collapsed: true,
                        path: '0/@/data/c',
                        close: 'array',
                    },
                    {level: 3, close: 'object'},
                    {level: 2, close: 'attributes', hasDelimiter: true},
                    {
                        level: 2,
                        value: makeValue(null, 'null'),
                        isAfterAttributes: true,
                    },
                    {level: 1, close: 'attributes-value', hasDelimiter: true},

                    {level: 1, open: 'attributes-value', path: '1'},
                    {
                        level: 2,
                        open: 'attributes',
                        path: '1/@',
                        collapsed: true,
                        close: 'attributes',
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        value: makeValue(null, 'null'),
                        isAfterAttributes: true,
                    },
                    {level: 1, close: 'attributes-value'},
                    {level: 0, close: 'array'},
                ];
                expect(result).toEqual({data: expected, searchIndex: {}});
            });

            it('collapsed values', () => {
                const converted = unipika.converters.yson({
                    $attributes: {
                        a: {
                            $attributes: {test: 123},
                            $value: [1, 2, 3],
                        },
                    },
                    $value: {
                        d: [1, 2, 3],
                        e: {
                            f: {
                                $attributes: {a: [5, 6, 7, 8]},
                                $value: 'F',
                            },
                            // g: {
                            //     h: 'H',
                            //     j: 'J',
                            // },
                        },
                    },
                });
                const result = flattenUnipika(converted, {
                    isJson: true,
                    collapsedState: {
                        '@/a/$': true,
                        '$/d': true,
                        '$/e/f/@': true,
                        '$/e/g': true,
                    },
                });
                const expected: UnipikaFlattenTree = [
                    {level: 0, open: 'attributes-value'},
                    {level: 1, open: 'attributes', path: '@'},
                    {
                        level: 2,
                        key: makeKey('a'),
                        open: 'attributes-value',
                        path: '@/a',
                    },
                    {level: 3, open: 'attributes', path: '@/a/@'},
                    {
                        level: 4,
                        key: makeKey('test'),
                        value: makeValue(123, 'number'),
                    },
                    {level: 3, close: 'attributes', hasDelimiter: true},
                    {
                        level: 3,
                        open: 'array',
                        collapsed: true,
                        path: '@/a/$',
                        isAfterAttributes: true,
                        close: 'array',
                    },
                    {level: 2, close: 'attributes-value'},
                    {level: 1, close: 'attributes', hasDelimiter: true},
                    {
                        level: 1,
                        open: 'object',
                        isAfterAttributes: true,
                        path: '$',
                    },
                    {
                        level: 2,
                        open: 'array',
                        key: makeKey('d'),
                        path: '$/d',
                        collapsed: true,
                        close: 'array',
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        open: 'object',
                        key: makeKey('e'),
                        path: '$/e',
                    },
                    {
                        level: 3,
                        key: makeKey('f'),
                        open: 'attributes-value',
                        path: '$/e/f',
                    },
                    {
                        level: 4,
                        open: 'attributes',
                        path: '$/e/f/@',
                        collapsed: true,
                        close: 'attributes',
                        hasDelimiter: true,
                    },
                    {
                        level: 4,
                        value: makeValue('F', 'string'),
                        isAfterAttributes: true,
                    },
                    {level: 3, close: 'attributes-value'},
                    {level: 2, close: 'object'},
                    {level: 1, close: 'object'},
                    {level: 0, close: 'attributes-value'},
                ];
                expect(result).toEqual({data: expected, searchIndex: {}});
            });
        });
    });

    describe('with matchedState', () => {
        describe('YSON', () => {
            let converted: any;
            let expected: UnipikaFlattenTree;

            beforeEach(() => {
                converted = unipika.converters.yson({
                    allow_aggressive: true,
                    auto_merge: {
                        chunk_size_size: 134217728,
                        mode: 'disabled_size',
                        job_io: {
                            table_writer: {
                                max_key_weight: 16384,
                                desired_chunk_size: 2147483648,
                                group_size: '1size_2size_3size',
                            },
                        },
                    },
                });

                expected = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('allow_aggressive'),
                        value: makeValue(true, 'boolean'),
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        open: 'object',
                        key: makeKey('auto_merge'),
                        path: 'auto_merge',
                    },
                    {
                        level: 2,
                        key: makeKey('chunk_size_size'),
                        value: makeValue(134217728, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('mode'),
                        value: makeValue('disabled_size', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        open: 'object',
                        key: makeKey('job_io'),
                        path: 'auto_merge/job_io',
                    },
                    {
                        level: 3,
                        open: 'object',
                        key: makeKey('table_writer'),
                        path: 'auto_merge/job_io/table_writer',
                    },
                    {
                        level: 4,
                        key: makeKey('max_key_weight'),
                        value: makeValue(16384, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 4,
                        key: makeKey('desired_chunk_size'),
                        value: makeValue(2147483648, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 4,
                        key: makeKey('group_size'),
                        value: makeValue('1size_2size_3size', 'string'),
                    },
                    {level: 3, close: 'object'},
                    {level: 2, close: 'object'},
                    {level: 1, close: 'object'},
                    {level: 0, close: 'object'},
                ];
            });
            it('find part of a string', () => {
                const searchIndex: FlattenUnipikaResult['searchIndex'] = {
                    '3': {
                        keyMatch: [6, 11],
                    },
                    '4': {
                        valueMatch: [9],
                    },
                    '8': {
                        keyMatch: [14],
                    },
                    '9': {
                        keyMatch: [6],
                        valueMatch: [1, 7, 13],
                    },
                };
                const result = flattenUnipika(converted, {
                    filter: 'size',
                    settings: {format: 'yson'},
                });
                expect(result).toEqual({data: expected, searchIndex});
            });
            it('find part of a number', () => {
                const searchIndex: FlattenUnipikaResult['searchIndex'] = {
                    '3': {
                        valueMatch: [3],
                    },
                };
                const result = flattenUnipika(converted, {
                    filter: '2177',
                    settings: {format: 'yson'},
                });
                expect(result).toEqual({data: expected, searchIndex});
            });
            it('find part of a boolean', () => {
                const searchIndex: FlattenUnipikaResult['searchIndex'] = {
                    '1': {
                        valueMatch: [0],
                    },
                };
                const result = flattenUnipika(converted, {
                    filter: '%true',
                    settings: {format: 'yson'},
                });
                expect(result).toEqual({data: expected, searchIndex});
            });
        });
        describe('JSON', () => {
            let converted: any;
            let expected: UnipikaFlattenTree;

            beforeEach(() => {
                converted = unipika.converters.yson({
                    allow_aggressive: true,
                    auto_merge: {
                        chunk_size_size: 134217728,
                        mode: 'disabled_size',
                        job_io: {
                            table_writer: {
                                max_key_weight: 16384,
                                desired_chunk_size: 2147483648,
                                group_size: '1size_2size_3size',
                            },
                        },
                    },
                });

                expected = [
                    {level: 0, open: 'object'},
                    {
                        level: 1,
                        key: makeKey('allow_aggressive'),
                        value: makeValue(true, 'boolean'),
                        hasDelimiter: true,
                    },
                    {
                        level: 1,
                        open: 'object',
                        key: makeKey('auto_merge'),
                        path: 'auto_merge',
                    },
                    {
                        level: 2,
                        key: makeKey('chunk_size_size'),
                        value: makeValue(134217728, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        key: makeKey('mode'),
                        value: makeValue('disabled_size', 'string'),
                        hasDelimiter: true,
                    },
                    {
                        level: 2,
                        open: 'object',
                        key: makeKey('job_io'),
                        path: 'auto_merge/job_io',
                    },
                    {
                        level: 3,
                        open: 'object',
                        key: makeKey('table_writer'),
                        path: 'auto_merge/job_io/table_writer',
                    },
                    {
                        level: 4,
                        key: makeKey('max_key_weight'),
                        value: makeValue(16384, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 4,
                        key: makeKey('desired_chunk_size'),
                        value: makeValue(2147483648, 'number'),
                        hasDelimiter: true,
                    },
                    {
                        level: 4,
                        key: makeKey('group_size'),
                        value: makeValue('1size_2size_3size', 'string'),
                    },
                    {level: 3, close: 'object'},
                    {level: 2, close: 'object'},
                    {level: 1, close: 'object'},
                    {level: 0, close: 'object'},
                ];
            });
            it('find part of a string', () => {
                const searchIndex: FlattenUnipikaResult['searchIndex'] = {
                    '3': {
                        keyMatch: [6, 11],
                    },
                    '4': {
                        valueMatch: [9],
                    },
                    '8': {
                        keyMatch: [14],
                    },
                    '9': {
                        keyMatch: [6],
                        valueMatch: [1, 7, 13],
                    },
                };
                const result = flattenUnipika(converted, {
                    filter: 'size',
                    isJson: true,
                    settings: {format: 'json'},
                });
                expect(result).toEqual({data: expected, searchIndex});
            });
            it('find part of a number', () => {
                const searchIndex: FlattenUnipikaResult['searchIndex'] = {
                    '3': {
                        valueMatch: [3],
                    },
                };
                const result = flattenUnipika(converted, {
                    filter: '2177',
                    isJson: true,
                    settings: {format: 'json'},
                });
                expect(result).toEqual({data: expected, searchIndex});
            });
            it('find part of a boolean', () => {
                const searchIndex: FlattenUnipikaResult['searchIndex'] = {
                    '1': {
                        valueMatch: [1],
                    },
                };
                const result = flattenUnipika(converted, {
                    filter: 'rue',
                    isJson: true,
                    settings: {format: 'json'},
                });
                expect(result).toEqual({data: expected, searchIndex});
            });
        });
    });
});

function makeRawKey(key: string) {
    const $type = 'string' as 'string';
    const $key = true as true;
    return {$value: key, $type, $key};
}

function makeKey(key: string) {
    const $type = 'string' as 'string';
    const $key = true as true;
    return {$value: key, $type, $key, $decoded_value: key};
}

function makeRawValue<V, T>(value: V, type: T) {
    return {$value: value, $type: type};
}

function makeValue<V, T>(value: V, type: T) {
    if (type === ('string' as unknown)) {
        return {$value: value, $type: type, $decoded_value: value};
    }
    return {$value: value, $type: type || (typeof value as any as T)};
}
