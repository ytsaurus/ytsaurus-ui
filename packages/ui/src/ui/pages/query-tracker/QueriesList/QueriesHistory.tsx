import React from 'react';
import {
    QueriesHistory as QueriesHistoryWidget,
    type QueryListLinkRenderer,
} from '@gravity-ui/querieskit';

import {QUERY_POLLING_INTERVAL} from '../../../constants/queries';
import {RoutedLink} from '../../../containers/RoutedLink/RoutedLink';
import {useUpdater} from '../../../hooks/use-updater';
import {
    loadNextQueriesList,
    refreshQueriesList,
} from '../../../store/actions/query-tracker/queriesList';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {QueriesHistoryCursorDirection} from '../../../store/reducers/query-tracker/query-tracker-contants';
import {selectCluster} from '../../../store/selectors/global';
import {
    selectHasNextPage,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectQueriesList,
    selectQueriesListSearchMode,
    selectQueryListNewVisibleFields,
} from '../../../store/selectors/query-tracker/queriesList';
import {selectQuery} from '../../../store/selectors/query-tracker/query';
import {selectFullTextSearchSupported} from '../../../store/selectors/query-tracker/queryAco';
import {prepareHistoryItems} from './QueriesHistory/helpers';
import {type HistoryRow} from './QueriesHistory/types';
import {useQueriesHistoryEditing} from './QueriesHistory/useQueriesHistoryEditing';
import {useQueriesHistoryFilters} from './QueriesHistory/useQueriesHistoryFilters';
import {useQueriesHistorySearch} from './QueriesHistory/useQueriesHistorySearch';
import {useQueriesHistoryVisibleFields} from './QueriesHistory/useQueriesHistoryVisibleFields';
import i18n from './i18n';

const renderLink: QueryListLinkRenderer = (props) => (
    <RoutedLink {...props} href={props.href ?? ''} disablePreserveLocation />
);

export function QueriesHistory() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const queries = useSelector(selectQueriesList);
    const filter = useSelector(selectQueriesFilters);
    const searchMode = useSelector(selectQueriesListSearchMode);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasNextPage = useSelector(selectHasNextPage);
    const fullTextSearchSupported = useSelector(selectFullTextSearchSupported);
    const storedVisibleFields = useSelector(selectQueryListNewVisibleFields);
    const selectedQueryId = useSelector(selectQuery)?.id;

    const updateFn = React.useCallback(() => {
        dispatch(refreshQueriesList());
    }, [dispatch]);

    useUpdater(updateFn, {timeout: QUERY_POLLING_INTERVAL});

    const items = React.useMemo(
        () =>
            prepareHistoryItems({
                queries,
                cluster,
                searchMode,
                filter: filter.filter,
            }),
        [cluster, filter.filter, queries, searchMode],
    );

    const search = useQueriesHistorySearch({
        value: filter.filter,
        searchMode,
        fullTextSearchSupported,
    });
    const {config: filterConfig, formKey} = useQueriesHistoryFilters(filter);
    const {editing, getRowActions} = useQueriesHistoryEditing();
    const visibleFields = useQueriesHistoryVisibleFields(storedVisibleFields);

    const handleLoadMore = React.useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    return (
        <QueriesHistoryWidget<HistoryRow>
            key={formKey}
            className="queries-list__new-history"
            title={i18n('tab_history')}
            items={items}
            selectedRowId={selectedQueryId}
            search={search}
            filter={filterConfig}
            visibleFields={visibleFields}
            editing={editing}
            getRowActions={getRowActions}
            loading={isLoading}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            renderLink={renderLink}
        />
    );
}
