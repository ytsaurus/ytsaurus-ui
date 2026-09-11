import React from 'react';

import {skipToken} from '@reduxjs/toolkit/query';

import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';

import {resolveKeySchema, seedStateFilters} from '../state-filters';
import {AUTO_LOAD_DEBOUNCE_MS, READ_STATES_LIMIT, buildStateReadBody} from '../state-requests';
import i18n from './i18n';
import {deriveStateReadLifecycle, selectFirstComputation} from './state-read-lifecycle';
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
        setFiltersState((current) =>
            selectFirstComputation(current, {
                staticSpec,
                fixedComputationId,
                initialFilters,
                userModified: userModifiedRef.current,
            }),
        );
    }, [fixedComputationId, initialFilters, staticSpec]);

    const debouncedFilters = useDebouncedValue(filters, AUTO_LOAD_DEBOUNCE_MS);
    const debouncePending = filters !== debouncedFilters;
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
    const lifecycle = deriveStateReadLifecycle({
        hasDebouncedScope,
        hasResponse: Boolean(response),
        debouncePending,
        isFetching,
        isSuccess,
    });

    return {
        filters,
        setFilters,
        staticSpec,
        hasScope: Boolean(filters.computationId || filters.partitionId),
        validationError,
        response,
        debouncePending,
        ...lifecycle,
        error,
        refetch,
    };
}
