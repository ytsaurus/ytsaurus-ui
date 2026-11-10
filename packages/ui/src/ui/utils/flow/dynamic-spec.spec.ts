import {
    decodeDynamicSpecValue,
    dynamicSpecEdits,
    dynamicSpecPatchChangesFromDiff,
    dynamicSpecPatchDiff,
    dynamicSpecPath,
    dynamicSpecPathParts,
    encodeDynamicSpecValue,
} from './dynamic-spec';

describe('dynamic spec patch JSON', () => {
    const patch = {
        patch_id: 1,
        timestamp: '2026-11-02T15:55:23Z',
        changes: [
            {path: '/computations/noop/batch_duration', value: 1001},
            {
                path: '/computations/noop/max_rows_per_batch',
                value: {$type: 'uint64', $value: '18446744073709551615'},
            },
        ],
    };
    it('groups paths and preserves typed large values without mutating the patch', () => {
        const original = structuredClone(patch);
        expect(dynamicSpecPatchDiff(patch)).toEqual({
            computations: {
                noop: {
                    batch_duration: 1001,
                    max_rows_per_batch: patch.changes[1].value,
                },
            },
        });
        expect(patch).toEqual(original);
    });
    it('supports escaped and prototype-named keys as literal paths', () => {
        const diff = dynamicSpecPatchDiff({
            ...patch,
            changes: [{path: '/__proto__/a\\/b', value: 3}],
        });
        expect(Object.getPrototypeOf(diff)).toBeNull();
        expect(Object.getOwnPropertyDescriptor(diff, '__proto__')?.value).toEqual({'a/b': 3});
    });
});

describe('dynamic spec patch editing', () => {
    const patch = {
        patch_id: '9007199254740993',
        timestamp: '2026-11-02T15:55:23Z',
        changes: [{path: '/computations/noop', value: {batch_duration: 1001, limit: 10000}}],
    };
    it('preserves map replacement boundaries and sibling fields', () => {
        expect(
            dynamicSpecPatchChangesFromDiff(patch, {
                computations: {noop: {batch_duration: 1002, limit: 10000}},
            }),
        ).toEqual([{path: ['computations', 'noop'], value: {batch_duration: 1002, limit: 10000}}]);
        expect(patch.changes[0].value.batch_duration).toBe(1001);
    });
    it('round-trips escaped YPath keys', () => {
        const parts = ['computations', 'a/b', 'key\\name', '@value'];
        expect(dynamicSpecPathParts(dynamicSpecPath(parts))).toEqual(parts);
    });
    it.each([null, 42, [], {}])('rejects an empty or non-map diff (%j)', (diff) => {
        expect(dynamicSpecPatchChangesFromDiff(patch, diff)).toEqual([]);
    });
    it('preserves Unicode, binary siblings and exact typed uint64 values', () => {
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
});

describe('root dynamic spec diff', () => {
    it('groups multiple edits without including unchanged effective patches or siblings', () => {
        const before = {
            computations: {noop: {batch_duration: 1002, max_rows_per_batch: 2000}},
            controller: {limit: 4},
        };
        const after = {
            computations: {noop: {batch_duration: 1003, max_rows_per_batch: 2000}},
            controller: {limit: 5},
        };
        expect(dynamicSpecEdits(before, after)).toEqual([
            {path: ['computations', 'noop', 'batch_duration'], value: 1003},
            {path: ['controller', 'limit'], value: 5},
        ]);
        expect(before.computations.noop.max_rows_per_batch).toBe(2000);
    });
    it('preserves typed integers, UTF8 text and unchanged annotated values', () => {
        const integer = {$type: 'int64', $value: '9223372036854775807'};
        const unsigned = {$type: 'uint64', $value: '18446744073709551615'};
        const before = {stable: integer, limit: integer, title: 'ascii'};
        const human = {
            ...(decodeDynamicSpecValue(before) as typeof before),
            limit: unsigned,
            title: 'Причина',
        };
        const after = encodeDynamicSpecValue(human, before);
        expect(dynamicSpecEdits(before, after)).toEqual([
            {path: ['limit'], value: unsigned},
            {path: ['title'], value: encodeDynamicSpecValue('Причина', 'ascii')},
        ]);
    });
    it.each([{}, {computations: {}}])('marks removed maps or fields for rejection: %j', (after) => {
        expect(dynamicSpecEdits({computations: {noop: {limit: 4}}}, after)).toEqual([
            {
                path: Object.keys(after).length ? ['computations', 'noop'] : ['computations'],
                value: undefined,
            },
        ]);
    });
    it('treats an edited list as one Set and detects lifecycle changes explicitly', () => {
        expect(
            dynamicSpecEdits(
                {names: ['a'], target_state: 'working'},
                {names: ['a', 'b'], target_state: 'paused'},
            ),
        ).toEqual([
            {path: ['names'], value: ['a', 'b']},
            {path: ['target_state'], value: 'paused'},
        ]);
    });
    it('returns no changes for identical values', () => {
        expect(dynamicSpecEdits({a: {b: 2}}, {a: {b: 2}})).toEqual([]);
    });
});
