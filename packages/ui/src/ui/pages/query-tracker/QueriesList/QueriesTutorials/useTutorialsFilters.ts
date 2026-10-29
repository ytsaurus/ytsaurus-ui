import React from 'react';
import {type QueryListFilterConfig} from '@gravity-ui/querieskit';

import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import {type QueriesListFilter} from '../../../../types/query-tracker/queryList';
import {ALL_VALUE, getEngineFilterField, getSelectedEngine} from '../helpers/filters';

type FilterValues = {
    engine?: string[];
};

const defaultValues: FilterValues = {engine: [ALL_VALUE]};

export function useTutorialsFilters(filter: QueriesListFilter) {
    const dispatch = useDispatch();

    const fields = React.useMemo<QueryListFilterConfig['fields']>(
        () => [getEngineFilterField()],
        [],
    );

    const currentValues = React.useMemo<FilterValues>(
        () => ({engine: [filter.engine ?? ALL_VALUE]}),
        [filter.engine],
    );

    const handleApply = React.useCallback(
        (values: Record<string, unknown>) => {
            const {engine} = values as FilterValues;
            dispatch(
                applyFilter({
                    engine: getSelectedEngine(engine),
                }),
            );
        },
        [dispatch],
    );

    const handleReset = React.useCallback(() => {
        dispatch(resetFilter());
    }, [dispatch]);

    const config = React.useMemo<QueryListFilterConfig>(
        () => ({
            fields,
            values: currentValues,
            initialValues: defaultValues,
            isChanged: Boolean(filter.engine),
            onApply: handleApply,
            onReset: handleReset,
        }),
        [fields, filter.engine, handleApply, handleReset, currentValues],
    );

    return config;
}
