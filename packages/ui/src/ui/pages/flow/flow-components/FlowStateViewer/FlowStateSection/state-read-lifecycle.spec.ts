import type {FlowStaticSpec} from '../../../../../../shared/yt-types';
import {filters} from '../state-test-fixtures';
import {deriveStateReadLifecycle, selectFirstComputation} from './state-read-lifecycle';

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
