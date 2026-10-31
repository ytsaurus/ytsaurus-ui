import type {FlowStaticSpec} from '../../../../../../shared/yt-types';
import {filters} from '../state-test-fixtures';
import {
    buildEffectiveReadBody,
    deriveStateReadLifecycle,
    isAwaitingKeySchema,
    selectFirstComputation,
} from './state-read-lifecycle';

const staticSpec: FlowStaticSpec = {
    computations: {first: {}, second: {}},
};

describe('selectFirstComputation', () => {
    it('selects the first computation when describe data arrives', () => {
        expect(
            selectFirstComputation(filters({}), {
                staticSpec,
                userModified: false,
            }),
        ).toEqual(filters({computationId: 'first'}));
    });

    it.each([
        ['fixed computation', {fixedComputationId: 'fixed'}, filters({})],
        ['initial computation', {initialFilters: {computationId: 'initial'}}, filters({})],
        ['initial partition', {initialFilters: {partitionId: 'partition'}}, filters({})],
        ['user selection', {userModified: true}, filters({computationId: 'second'})],
        ['explicit user clear', {userModified: true}, filters({})],
        ['explicitly cleared restored form', {hasRestoredFilters: true}, filters({})],
        [
            'restored form without scope',
            {hasRestoredFilters: true, initialFilters: {target: 'key_state'}},
            filters({target: 'key_state'}),
        ],
    ] as const)('preserves %s', (_name, options, current) => {
        expect(
            selectFirstComputation(current, {
                staticSpec,
                userModified: false,
                ...options,
            }),
        ).toBe(current);
    });
});

describe('deriveStateReadLifecycle', () => {
    it('treats a pending debounce as refreshing retained data', () => {
        expect(
            deriveStateReadLifecycle({
                hasDebouncedScope: true,
                hasResponse: true,
                debouncePending: true,
                isFetching: false,
                isSuccess: true,
            }),
        ).toEqual({initialLoading: false, refreshing: true, readSucceeded: false});
    });

    it('distinguishes an initial request from a completed retained response', () => {
        expect(
            deriveStateReadLifecycle({
                hasDebouncedScope: true,
                hasResponse: false,
                debouncePending: false,
                isFetching: true,
                isSuccess: false,
            }),
        ).toEqual({initialLoading: true, refreshing: false, readSucceeded: false});
        expect(
            deriveStateReadLifecycle({
                hasDebouncedScope: true,
                hasResponse: true,
                debouncePending: false,
                isFetching: false,
                isSuccess: true,
            }),
        ).toEqual({initialLoading: false, refreshing: false, readSucceeded: true});
    });

    it('does not expose stale query state without a debounced scope', () => {
        expect(
            deriveStateReadLifecycle({
                hasDebouncedScope: false,
                hasResponse: true,
                debouncePending: false,
                isFetching: false,
                isSuccess: true,
            }),
        ).toEqual({initialLoading: false, refreshing: false, readSucceeded: false});
    });
});

describe('buildEffectiveReadBody', () => {
    const int64Spec: FlowStaticSpec = {
        computations: {checkout: {group_by_schema: [{name: 'id', type: 'int64'}]}},
    };
    const schemaLessSpec: FlowStaticSpec = {computations: {checkout: {}}};
    const restoredKey = filters({computationId: 'checkout', keyText: '[9007199254740993]'});

    it.each([
        ['pending', undefined],
        ['rejected', undefined],
        ['stale', int64Spec],
    ] as const)(
        'waits for a resolved spec before reading a %s restored key',
        (_name, unresolvedSpec) => {
            expect(isAwaitingKeySchema(restoredKey, false)).toBe(true);
            expect(
                buildEffectiveReadBody(restoredKey, {
                    staticSpec: unresolvedSpec,
                    staticSpecResolved: false,
                }),
            ).toBeUndefined();
        },
    );

    it('sends the exact named 64-bit key once the spec resolves', () => {
        expect(isAwaitingKeySchema(restoredKey, true)).toBe(false);
        expect(
            buildEffectiveReadBody(restoredKey, {
                staticSpec: int64Spec,
                staticSpecResolved: true,
            }),
        ).toEqual({
            body: {
                computation_id: 'checkout',
                key: {id: {$type: 'int64', $value: '9007199254740993'}},
            },
        });
    });

    it('keeps raw keys for a resolved schema-less computation', () => {
        expect(
            buildEffectiveReadBody(filters({computationId: 'checkout', keyText: '["alice", 7]'}), {
                staticSpec: schemaLessSpec,
                staticSpecResolved: true,
            }),
        ).toEqual({body: {computation_id: 'checkout', key: ['alice', 7]}});
    });

    it('reads without waiting when no key text is set', () => {
        expect(isAwaitingKeySchema(filters({computationId: 'checkout', keyText: ' '}), false)).toBe(
            false,
        );
        expect(
            buildEffectiveReadBody(filters({computationId: 'checkout', keyText: ''}), {
                staticSpec: undefined,
                staticSpecResolved: false,
            }),
        ).toEqual({body: {computation_id: 'checkout'}});
    });

    it.each([
        ['resolved', int64Spec, true],
        ['unresolved', undefined, false],
    ] as const)(
        'reads a partition despite a hidden invalid key draft with a %s spec',
        (_name, partitionSpec, staticSpecResolved) => {
            const partitionScoped = filters({
                computationId: 'checkout',
                partitionId: 'p1',
                keyText: '[7',
            });
            expect(isAwaitingKeySchema(partitionScoped, staticSpecResolved)).toBe(false);
            expect(
                buildEffectiveReadBody(partitionScoped, {
                    staticSpec: partitionSpec,
                    staticSpecResolved,
                }),
            ).toEqual({body: {partition_id: 'p1'}});
        },
    );

    it('blocks the computation read again once the partition is cleared', () => {
        expect(
            buildEffectiveReadBody(filters({computationId: 'checkout', keyText: '[7'}), {
                staticSpec: int64Spec,
                staticSpecResolved: true,
            }),
        ).toBeUndefined();
    });
});
