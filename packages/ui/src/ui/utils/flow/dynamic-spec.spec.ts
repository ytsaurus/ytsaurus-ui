import {dynamicSpecPatchDiff} from './dynamic-spec';

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
