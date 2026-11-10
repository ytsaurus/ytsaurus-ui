import React from 'react';
import {createHistoryFilter} from '@gravity-ui/querieskit/components/HistoryFilter';
import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import type {QueriesListFilter} from '../../../../types/query-tracker/queryList';
import {QueryEngineFilterField} from '../../QueriesList/QueriesListFilter/QueryEngineFilter/QueryEngineFilter';

export function useTutorialsFilters(filter: QueriesListFilter) {
    const dispatch = useDispatch();
    return createHistoryFilter<Pick<QueriesListFilter, 'engine'>>({
        initialValues: {engine: undefined},
        values: {engine: filter.engine},
        isChanged: Boolean(filter.engine),
        onApply: (value) => dispatch(applyFilter(value)),
        onReset: () => dispatch(resetFilter()),
        renderFields: ({value, onChange}) => (
            <QueryEngineFilterField
                value={value.engine}
                onChange={(engine) => onChange({engine})}
            />
        ),
    });
}
