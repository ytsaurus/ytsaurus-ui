import type {FlowStaticSpec} from '../../../../../../shared/yt-types';
import {filters} from '../state-test-fixtures';
import {deriveStateReadLifecycle, selectFirstComputation} from './state-read-lifecycle';

const staticSpec: FlowStaticSpec = {
    computations: {first: {}, second: {}},
};

describe('selectFirstComputation', () => {
    it.each(['all', 'key_state', 'partition_state', 'external_key_state'] as const)(
        'preserves target %s when selecting the first computation without a schema',
        (target) => {
            expect(
                selectFirstComputation(filters({target}), {
                    staticSpec,
                    userModified: false,
                }),
            ).toEqual(filters({computationId: 'first', target}));
        },
    );

    it.each([
        ['fixed computation', {fixedComputationId: 'fixed'}, filters({})],
        ['initial computation', {}, filters({computationId: 'initial'})],
        ['initial partition', {}, filters({partitionId: 'partition'})],
        ['user selection', {userModified: true}, filters({computationId: 'second'})],
        ['explicit user clear', {userModified: true}, filters({})],
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
