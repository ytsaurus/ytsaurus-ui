import React from 'react';

import {skipToken} from '@reduxjs/toolkit/query';

import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';

import {reconcileStateTarget, resolveKeySchema, seedStateFilters} from '../state-filters';
import {AUTO_LOAD_DEBOUNCE_MS, READ_STATES_LIMIT, buildStateReadBody} from '../state-requests';
import i18n from './i18n';
import type {FlowStateFiltersValue, FlowStateReadResult} from '../types';

export function useFlowStateRead({
    pipeline_path,
    fixedComputationId,
    initialFilters,
}: {
    pipeline_path: string;
    fixedComputationId?: string;
    initialFilters?: Partial<FlowStateFiltersValue>;
}): FlowStateReadResult {
    const [filters, setFiltersState] = React.useState<FlowStateFiltersValue>(() =>
        seedStateFilters(fixedComputationId, initialFilters),
    );
    const userModifiedRef = React.useRef(false);
    const setFilters = React.useCallback<
        React.Dispatch<React.SetStateAction<FlowStateFiltersValue>>
    >((next) => {
        userModifiedRef.current = true;
        setFiltersState(next);
    }, []);
    const {data: staticSpec} = useFlowStaticSpecQuery({parameters: {pipeline_path}});

    React.useEffect(() => {
        const firstComputationId = Object.keys(staticSpec?.computations ?? {})[0];
        if (
            !firstComputationId ||
            userModifiedRef.current ||
            fixedComputationId ||
            initialFilters?.computationId ||
            initialFilters?.partitionId
        ) {
            return;
        }
        setFiltersState((current) => {
            if (current.computationId || current.partitionId) {
                return current;
            }
            return {
                ...current,
                computationId: firstComputationId,
                target: reconcileStateTarget(staticSpec, firstComputationId, current.target),
            };
        });
    }, [fixedComputationId, initialFilters, staticSpec]);

    const debouncedFilters = useDebouncedValue(filters, AUTO_LOAD_DEBOUNCE_MS);
    const hasDebouncedScope = Boolean(
        debouncedFilters.computationId || debouncedFilters.partitionId,
    );
    const built = hasDebouncedScope
        ? buildStateReadBody(
              debouncedFilters,
              resolveKeySchema(
                  staticSpec,
                  debouncedFilters.computationId,
                  debouncedFilters.stateName,
                  debouncedFilters.target,
              ),
          )
        : undefined;
    const validationError =
        built && 'error' in built ? i18n(built.error.errorKey, built.error.params) : undefined;
    const {data, error, isFetching, isSuccess, refetch} = useFlowReadStatesQuery(
        built && 'body' in built
            ? {parameters: {pipeline_path}, body: {...built.body, limit: READ_STATES_LIMIT}}
            : skipToken,
    );
    const response = hasDebouncedScope ? data : undefined;

    return {
        filters,
        setFilters,
        staticSpec,
        hasScope: Boolean(filters.computationId || filters.partitionId),
        validationError,
        response,
        initialLoading: hasDebouncedScope && isFetching && !response,
        refreshing: hasDebouncedScope && isFetching && Boolean(response),
        readSucceeded: hasDebouncedScope && isSuccess && !isFetching && Boolean(response),
        error,
        refetch,
    };
}
