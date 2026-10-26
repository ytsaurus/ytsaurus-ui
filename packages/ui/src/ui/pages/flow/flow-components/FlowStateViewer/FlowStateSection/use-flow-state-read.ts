import React from 'react';

import {skipToken} from '@reduxjs/toolkit/query';

import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {isMalformedUrlParam} from '../../../../../utils/url-mapping';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';

import {seedStateFilters} from '../state-filter-options';
import {AUTO_LOAD_DEBOUNCE_MS, READ_STATES_LIMIT} from '../state-requests';
import i18n from './i18n';
import {
    buildEffectiveReadBody,
    deriveStateReadLifecycle,
    isAwaitingKeySchema,
    selectFirstComputation,
} from './state-read-lifecycle';
import type {FlowStateFiltersValue, FlowStateReadResult} from '../types';

export function useFlowStateRead({
    pipeline_path,
    fixedComputationId,
    initialFilters,
    restoredFilters,
    restoredUrlMalformed = false,
}: {
    pipeline_path: string;
    fixedComputationId?: string;
    initialFilters?: Partial<FlowStateFiltersValue>;
    restoredFilters?: Partial<FlowStateFiltersValue>;
    restoredUrlMalformed?: boolean;
}): FlowStateReadResult {
    const seedFilters = restoredFilters ?? initialFilters;
    const [filters, setFiltersState] = React.useState<FlowStateFiltersValue>(() =>
        seedStateFilters(fixedComputationId, seedFilters),
    );
    const [urlBlocked, setUrlBlocked] = React.useState(restoredUrlMalformed);
    const userModifiedRef = React.useRef(false);
    const invalidPipelinePath = !pipeline_path || isMalformedUrlParam(pipeline_path);
    const {
        data: staticSpec,
        isSuccess: staticSpecResolved,
        error: staticSpecError,
        refetch: refetchStaticSpec,
    } = useFlowStaticSpecQuery({parameters: {pipeline_path}}, {skip: invalidPipelinePath});
    const setFilters = React.useCallback<
        React.Dispatch<React.SetStateAction<FlowStateFiltersValue>>
    >(
        (next) => {
            userModifiedRef.current = true;
            setUrlBlocked(false);
            setFiltersState(next);
            if (staticSpecError) {
                refetchStaticSpec();
            }
        },
        [refetchStaticSpec, staticSpecError],
    );

    React.useEffect(() => {
        setFiltersState((current) =>
            selectFirstComputation(current, {
                staticSpec,
                fixedComputationId,
                initialFilters: seedFilters,
                hasRestoredFilters: restoredFilters !== undefined,
                userModified: userModifiedRef.current,
            }),
        );
    }, [fixedComputationId, restoredFilters, seedFilters, staticSpec]);

    const readInput = React.useMemo(() => ({filters, urlBlocked}), [filters, urlBlocked]);
    const debouncedInput = useDebouncedValue(readInput, AUTO_LOAD_DEBOUNCE_MS);
    const debouncedFilters = debouncedInput.filters;
    const debouncePending = readInput !== debouncedInput;
    const hasDebouncedScope = Boolean(
        debouncedFilters.computationId || debouncedFilters.partitionId,
    );
    const readBlocked = debouncedInput.urlBlocked || invalidPipelinePath;
    const readable = hasDebouncedScope && !readBlocked;
    const built = readable
        ? buildEffectiveReadBody(debouncedFilters, {staticSpec, staticSpecResolved})
        : undefined;
    const awaitingKeySchema = readable && isAwaitingKeySchema(debouncedFilters, staticSpecResolved);
    const buildError =
        built && 'error' in built ? i18n(built.error.errorKey, built.error.params) : undefined;
    const validationError = urlBlocked ? i18n('validation_unsupported-url-filters') : buildError;
    const {
        data,
        error: readError,
        isFetching,
        isSuccess,
        refetch,
    } = useFlowReadStatesQuery(
        built && 'body' in built
            ? {parameters: {pipeline_path}, body: {...built.body, limit: READ_STATES_LIMIT}}
            : skipToken,
    );
    const response = readable ? data : undefined;
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
        staticSpecResolved,
        hasScope: Boolean(filters.computationId || filters.partitionId),
        validationError,
        response,
        debouncePending,
        ...lifecycle,
        error: readError ?? (awaitingKeySchema ? staticSpecError : undefined),
        refetch,
    };
}
