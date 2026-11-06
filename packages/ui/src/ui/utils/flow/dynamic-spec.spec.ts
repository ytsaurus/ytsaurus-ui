import {
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecHasComment,
    dynamicSpecPath,
    dynamicSpecVersion,
    encodeDynamicSpecValue,
} from './dynamic-spec';

describe('DynamicSpec root edits', () => {
    it('diffs independent branches without copying unchanged fields', () => {
        expect(dynamicSpecEdits({a: {b: 1, same: 4}, c: 2}, {a: {b: 3, same: 4}, c: 5})).toEqual([
            {path: ['a', 'b'], value: 3},
            {path: ['c'], value: 5},
        ]);
    });
    it('sets a new map atomically and replaces lists', () => {
        expect(dynamicSpecEdits({list: [1, 2]}, {list: [3], added: {nested: 4}})).toEqual([
            {path: ['list'], value: [3]},
            {path: ['added'], value: {nested: 4}},
        ]);
    });
    it('reports removed fields and maps before serialization can drop undefined', () => {
        expect(dynamicSpecEdits({a: {b: 1}, c: 2}, {a: {}})).toEqual([
            {path: ['a', 'b'], value: undefined},
            {path: ['c'], value: undefined},
        ]);
    });
    it('distinguishes null from removed fields', () => {
        expect(dynamicSpecEdits({a: 1}, {a: null})).toEqual([{path: ['a'], value: null}]);
    });
    it('preserves unchanged raw strings while encoding new values', () => {
        const raw = {
            text: '\u00d0\u00bf\u00d1\u0080\u00d0\u00b8\u00d0\u00b2\u00d0\u00b5\u00d1\u0082',
        };
        expect(encodeDynamicSpecValue(decodeDynamicSpecValue(raw), raw)).toBe(raw);
        expect(
            dynamicSpecEdits(
                raw,
                encodeDynamicSpecValue({...(decodeDynamicSpecValue(raw) as object), count: 2}, raw),
            ),
        ).toEqual([{path: ['count'], value: 2}]);
    });
    it('escapes YPath keys and keeps int64 versions lossless', () => {
        expect(dynamicSpecPath(['a/b', 'c'])).toBe('/a\\/b/c');
        expect(dynamicSpecVersion({$type: 'int64', $value: '1923307469208162014'})).toBe(
            '1923307469208162014',
        );
        expect(() => dynamicSpecVersion(Number('1923307469208162014'))).toThrow();
    });
    it('requires a non-whitespace comment', () => {
        expect(dynamicSpecHasComment('\n\u0085 ')).toBe(false);
        expect(dynamicSpecHasComment('Tune rates')).toBe(true);
    });
});
