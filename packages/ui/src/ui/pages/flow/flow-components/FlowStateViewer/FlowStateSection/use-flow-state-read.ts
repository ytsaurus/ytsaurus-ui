import React from 'react';

import {skipToken} from '@reduxjs/toolkit/query';

import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';

import {resolveKeySchema, seedStateFilters} from '../state-filters';
import {AUTO_LOAD_DEBOUNCE_MS, buildStateReadBody} from '../state-requests';
import i18n from './i18n';
import type {FlowStateFiltersValue} from '../types';

export function useFlowStateRead({
    pipeline_path,
    fixedComputationId,
    initialFilters,
}: {
    pipeline_path: string;
    fixedComputationId?: string;
    initialFilters?: Partial<FlowStateFiltersValue>;
}) {
    const [filters, setFilters] = React.useState<FlowStateFiltersValue>(() =>
        seedStateFilters(fixedComputationId, initialFilters),
    );
    const {data: staticSpec} = useFlowStaticSpecQuery({parameters: {pipeline_path}});
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
    const {data, error, isFetching, refetch} = useFlowReadStatesQuery(
        built && 'body' in built
            ? {parameters: {pipeline_path}, body: {...built.body, limit: debouncedFilters.limit}}
            : skipToken,
    );

    return {
        filters,
        setFilters,
        staticSpec,
        hasScope: Boolean(filters.computationId || filters.partitionId),
        validationError,
        response: hasDebouncedScope ? data : undefined,
        loading: isFetching,
        error,
        refetch,
    };
}
