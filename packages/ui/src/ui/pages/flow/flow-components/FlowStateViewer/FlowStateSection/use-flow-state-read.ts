import {useCallback, useEffect, useRef} from 'react';

import {skipToken} from '@reduxjs/toolkit/query';

import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {filtersSlice} from '../../../../../store/reducers/flow/filters';
import {selectFlowStateFilters} from '../../../../../store/selectors/flow/filters';

import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';

import {resolveKeySchema} from '../state-schema';
import {AUTO_LOAD_DEBOUNCE_MS, READ_STATES_LIMIT, buildStateReadBody} from '../state-requests';
import i18n from './i18n';
import {deriveStateReadLifecycle, selectFirstComputation} from './state-read-lifecycle';
import type {FlowStateFiltersValue, FlowStateReadResult} from '../types';

export function useFlowStateRead({
    pipeline_path,
    fixedComputationId,
}: {
    pipeline_path: string;
    fixedComputationId?: string;
}): FlowStateReadResult {
    const dispatch = useDispatch();
    const filters = useSelector((state) => selectFlowStateFilters(state, fixedComputationId));
    const userModifiedRef = useRef(false);
    const setFilters = useCallback(
        (next: FlowStateFiltersValue) => {
            userModifiedRef.current = true;
            dispatch(
                filtersSlice.actions.updateFlowFilters({
                    stateViewer: {
                        ...next,
                        computationId: fixedComputationId ? undefined : next.computationId,
                    },
                }),
            );
        },
        [dispatch, fixedComputationId],
    );
    const {data: staticSpec} = useFlowStaticSpecQuery({parameters: {pipeline_path}});

    useEffect(() => {
        const next = selectFirstComputation(filters, {
            staticSpec,
            fixedComputationId,
            userModified: userModifiedRef.current,
        });
        if (next !== filters) {
            dispatch(filtersSlice.actions.updateFlowFilters({stateViewer: next}));
        }
    }, [dispatch, filters, fixedComputationId, staticSpec]);

    const debouncedFilters = useDebouncedValue(filters, AUTO_LOAD_DEBOUNCE_MS);
    const debouncePending = filters !== debouncedFilters;
    const hasDebouncedScope = Boolean(
        debouncedFilters?.computationId || debouncedFilters?.partitionId,
    );
    const built =
        hasDebouncedScope && debouncedFilters
            ? buildStateReadBody(debouncedFilters, resolveKeySchema(staticSpec, debouncedFilters))
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
