import {type FlowDynamicSpecPatch} from '../../../shared/yt-types';
import {
    UnsafeDynamicSpecVersionError,
    decodeDynamicSpecValue,
    dynamicSpecHasComment,
    dynamicSpecPatchChangesFromDiff,
    dynamicSpecPatchDiff,
    dynamicSpecPath,
    dynamicSpecPathParts,
    dynamicSpecVersion,
    encodeDynamicSpecValue,
} from './dynamic-spec';

const patch: FlowDynamicSpecPatch = {
    patch_id: '1923189626042933625',
    timestamp: '2026-10-04T10:00:00Z',
    changes: [
        {path: '/computations/noop/batch_duration', value: 1001},
        {path: '/computations/noop/max_rows_per_batch', value: 2000},
    ],
};

describe('dynamic spec patch JSON', () => {
    it('groups several paths into a nested diff', () => {
        expect(dynamicSpecPatchDiff(patch)).toEqual({
            computations: {noop: {batch_duration: 1001, max_rows_per_batch: 2000}},
        });
    });

    it('preserves map replacement boundaries when updating a diff', () => {
        const mapPatch = {
            ...patch,
            changes: [{path: '/computations/noop', value: {batch_duration: 1001, limit: 10000}}],
        };
        expect(
            dynamicSpecPatchChangesFromDiff(mapPatch, {
                computations: {noop: {batch_duration: 1002, limit: 10000}},
            }),
        ).toEqual([{path: ['computations', 'noop'], value: {batch_duration: 1002, limit: 10000}}]);
    });

    it('keeps independent patches immutable while constructing their diffs', () => {
        const original = structuredClone(patch);
        dynamicSpecPatchDiff(patch);
        dynamicSpecPatchChangesFromDiff(patch, {computations: {noop: {batch_duration: 1002}}});
        expect(patch).toEqual(original);
    });

    it('supports prototype-named keys as literal paths', () => {
        const value = dynamicSpecPatchDiff({
            ...patch,
            changes: [{path: '/__proto__/constructor', value: 3}],
        });
        expect(Object.keys(value)).toEqual(['__proto__']);
        expect(Object.getOwnPropertyDescriptor(value, '__proto__')?.value).toEqual({
            constructor: 3,
        });
        expect(Object.getPrototypeOf(value)).toBeNull();
    });

    it('round-trips escaped YPath keys', () => {
        const parts = ['computations', 'a/b', 'key\\name', '@value'];
        expect(dynamicSpecPathParts(dynamicSpecPath(parts))).toEqual(parts);
    });

    it.each([null, 42, [], {}])('rejects an empty or non-map diff (%j)', (diff) => {
        expect(dynamicSpecPatchChangesFromDiff(patch, diff)).toEqual([]);
    });
});

describe('web-json patch values', () => {
    it('round-trips Unicode, binary siblings and exact typed values', () => {
        const rawKey = Buffer.from('Квота').toString('latin1');
        const original = {
            [rawKey]: Buffer.from('Причина 😊').toString('latin1'),
            binary: '\xff',
            limit: {$type: 'uint64', $value: '18446744073709551615'},
            changed: 1,
        };
        const decoded = decodeDynamicSpecValue(original) as Record<string, unknown>;
        expect(decoded.Квота).toBe('Причина 😊');
        expect(encodeDynamicSpecValue({...decoded, changed: 2}, original)).toEqual({
            ...original,
            changed: 2,
        });
        expect(encodeDynamicSpecValue(decoded, original)).toBe(original);
    });

    it('keeps adjacent 19-digit identifiers distinct and rejects rounded numbers', () => {
        expect(dynamicSpecVersion({$type: 'int64', $value: '1923189626042933625'})).toBe(
            '1923189626042933625',
        );
        expect(dynamicSpecVersion('1923189626042933626')).toBe('1923189626042933626');
        expect(() => dynamicSpecVersion(Number('1923189626042933625'))).toThrow(
            UnsafeDynamicSpecVersionError,
        );
    });

    it.each(['', ' ', '\t\n', '\u0085', '\ufeff'])(
        'rejects an empty update reason (%j)',
        (comment) => {
            expect(dynamicSpecHasComment(comment)).toBe(false);
        },
    );

    it('accepts a Unicode update reason', () => {
        expect(dynamicSpecHasComment('Исправление YTFRONT-6091')).toBe(true);
    });
});
