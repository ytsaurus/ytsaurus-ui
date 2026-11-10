import React from 'react';
import {createHistoryFilter} from '@gravity-ui/querieskit/components/HistoryFilter';
import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectCurrentUserName} from '../../../../store/selectors/global';
import {
    QueriesListAuthorFilter,
    type QueriesListFilter,
} from '../../../../types/query-tracker/queryList';
import {
    type HistoryFilterValue,
    QueryHistoryFilterFields,
} from '../../QueriesList/QueriesListFilter/QueryHistoryFilterFields/QueryHistoryFilterFields';

const initialValues: HistoryFilterValue = {
    user: QueriesListAuthorFilter.My,
    from: undefined,
    to: undefined,
    state: undefined,
    engine: undefined,
};

export function useQueriesHistoryFilters(filter: QueriesListFilter) {
    const dispatch = useDispatch();
    const login = useSelector(selectCurrentUserName);
    const {from, to, user, state, engine} = filter;
    return createHistoryFilter<HistoryFilterValue>({
        initialValues,
        values: {from, to, user, state, engine},
        isChanged: Boolean(
            from ||
            to ||
            state ||
            engine ||
            (user !== QueriesListAuthorFilter.My && user !== login),
        ),
        onApply: (value) => dispatch(applyFilter(value)),
        onReset: () => dispatch(resetFilter()),
        renderFields: ({value, onChange}) => (
            <QueryHistoryFilterFields value={value} onChange={onChange} />
        ),
    });
}
