import type {FlowStaticSpec} from '../../../../../../shared/yt-types';
import {reconcileStateTarget} from '../state-filter-options';
import {resolveEffectiveKey} from '../state-key';
import {buildStateReadBody} from '../state-requests';
import {resolveKeySchema} from '../state-schema';
import type {FlowStateFiltersValue} from '../types';

export function selectFirstComputation(
    current: FlowStateFiltersValue,
    {
        staticSpec,
        fixedComputationId,
        initialFilters,
        hasRestoredFilters = false,
        userModified,
    }: {
        staticSpec?: FlowStaticSpec;
        fixedComputationId?: string;
        initialFilters?: Partial<FlowStateFiltersValue>;
        hasRestoredFilters?: boolean;
        userModified: boolean;
    },
): FlowStateFiltersValue {
    const firstComputationId = Object.keys(staticSpec?.computations ?? {})[0];
    if (
        !firstComputationId ||
        userModified ||
        hasRestoredFilters ||
        fixedComputationId ||
        initialFilters?.computationId ||
        initialFilters?.partitionId ||
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

export function isAwaitingKeySchema(
    filters: FlowStateFiltersValue,
    staticSpecResolved: boolean,
): boolean {
    return !staticSpecResolved && !filters.partitionId && Boolean(filters.keyText?.trim());
}

export function buildEffectiveReadBody(
    filters: FlowStateFiltersValue,
    {staticSpec, staticSpecResolved}: {staticSpec?: FlowStaticSpec; staticSpecResolved: boolean},
) {
    const keySchema = resolveKeySchema(
        staticSpec,
        filters.computationId,
        filters.stateName,
        filters.target,
    );
    if (filters.partitionId) {
        return buildStateReadBody(filters, keySchema);
    }
    if (isAwaitingKeySchema(filters, staticSpecResolved)) {
        return undefined;
    }
    const effectiveKey = resolveEffectiveKey(filters, keySchema.keyColumns);
    if (effectiveKey.error) {
        return undefined;
    }
    return buildStateReadBody(
        {...filters, keyValues: effectiveKey.keyValues ?? {}, rawKey: effectiveKey.rawKey},
        keySchema,
    );
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
