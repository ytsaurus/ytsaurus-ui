import type {FlowStaticSpec} from '../../../../../../shared/yt-types';
import {reconcileStateTarget} from '../state-filter-options';
import type {FlowStateFiltersValue} from '../types';

export function selectFirstComputation(
    current: FlowStateFiltersValue,
    {
        staticSpec,
        fixedComputationId,
        userModified,
    }: {
        staticSpec?: FlowStaticSpec;
        fixedComputationId?: string;
        userModified: boolean;
    },
): FlowStateFiltersValue {
    const firstComputationId = Object.keys(staticSpec?.computations ?? {})[0];
    if (
        !firstComputationId ||
        userModified ||
        fixedComputationId ||
        current.computationId ||
        current.partitionId
    ) {
        return current;
    }
    return {
        ...current,
        computationId: firstComputationId,
        target: reconcileStateTarget(staticSpec, firstComputationId, current.target),
    };
}

export function deriveStateReadLifecycle({
    hasDebouncedScope,
    hasResponse,
    debouncePending,
    isFetching,
    isSuccess,
}: {
    hasDebouncedScope: boolean;
    hasResponse: boolean;
    debouncePending: boolean;
    isFetching: boolean;
    isSuccess: boolean;
}): {initialLoading: boolean; refreshing: boolean; readSucceeded: boolean} {
    return {
        initialLoading: hasDebouncedScope && isFetching && !hasResponse,
        refreshing: hasDebouncedScope && hasResponse && (debouncePending || isFetching),
        readSucceeded:
            hasDebouncedScope && !debouncePending && isSuccess && !isFetching && hasResponse,
    };
}
