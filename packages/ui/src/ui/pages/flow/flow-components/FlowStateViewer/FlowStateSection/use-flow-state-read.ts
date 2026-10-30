import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {skipToken} from '@reduxjs/toolkit/query';

import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {filtersSlice} from '../../../../../store/reducers/flow/filters';

import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';

import {seedStateFilters} from '../state-filter-options';
import {resolveKeySchema} from '../state-schema';
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
    const dispatch = useDispatch();
    const stateViewer = useSelector((state) => state.flow.filters.stateViewer);
    const filters = useMemo(
        () =>
            fixedComputationId ? {...stateViewer, computationId: fixedComputationId} : stateViewer,
        [fixedComputationId, stateViewer],
    );
    const [initialized, setInitialized] = useState(false);
    const userModifiedRef = useRef(false);
    const setFilters = useCallback(
        (next: FlowStateFiltersValue) => {
            userModifiedRef.current = true;
            dispatch(filtersSlice.actions.updateFlowFilters({stateViewer: next}));
        },
        [dispatch],
    );
    const {data: staticSpec} = useFlowStaticSpecQuery({parameters: {pipeline_path}});

    useEffect(() => {
        if (initialized) {
            return;
        }
        dispatch(
            filtersSlice.actions.updateFlowFilters({
                stateViewer: seedStateFilters(fixedComputationId, initialFilters),
            }),
        );
        setInitialized(true);
    }, [dispatch, fixedComputationId, initialFilters, initialized]);

    useEffect(() => {
        if (!initialized) {
            return;
        }
        const next = selectFirstComputation(filters, {
            staticSpec,
            fixedComputationId,
            initialFilters,
            userModified: userModifiedRef.current,
        });
        if (next !== filters) {
            dispatch(filtersSlice.actions.updateFlowFilters({stateViewer: next}));
        }
    }, [dispatch, filters, fixedComputationId, initialFilters, initialized, staticSpec]);

    const debouncedFilters = useDebouncedValue(
        initialized ? filters : undefined,
        AUTO_LOAD_DEBOUNCE_MS,
    );
    const debouncePending = filters !== debouncedFilters;
    const hasDebouncedScope = Boolean(
        debouncedFilters?.computationId || debouncedFilters?.partitionId,
    );
    const built =
        hasDebouncedScope && debouncedFilters
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
