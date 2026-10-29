import React from 'react';
import {
    type QueryListLinkRenderer,
    type QueryListSearchConfig,
    TutorialsHistory as TutorialsHistoryWidget,
} from '@gravity-ui/querieskit';

import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {loadNextQueriesList} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import {selectCluster} from '../../../../store/selectors/global';
import {
    selectHasNextPage,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectQueriesList,
    selectTutorialQueriesList,
} from '../../../../store/selectors/query-tracker/queriesList';
import {selectQuery} from '../../../../store/selectors/query-tracker/query';
import i18n from '../i18n';
import {filterTutorialItems, prepareTutorialItems} from './helpers';
import {type TutorialRow} from './types';
import {useTutorialsFilters} from './useTutorialsFilters';

const renderLink: QueryListLinkRenderer = (props) => (
    <RoutedLink {...props} href={props.href ?? ''} disablePreserveLocation />
);

export function QueriesTutorials() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const queries = useSelector(selectTutorialQueriesList);
    const allQueries = useSelector(selectQueriesList);
    const nextCursor = allQueries.at(-1)?.start_time;
    const filter = useSelector(selectQueriesFilters);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasNextPage = useSelector(selectHasNextPage);
    const selectedQueryId = useSelector(selectQuery)?.id;
    const [searchValue, setSearchValue] = React.useState('');
    const lastAutoLoad = React.useRef<{search: string; cursor: string} | undefined>(undefined);
    const filterConfig = useTutorialsFilters(filter);

    const items = React.useMemo(
        () =>
            prepareTutorialItems({
                queries,
                cluster,
                noNameTitle: i18n('field_no-name'),
            }),
        [cluster, queries],
    );
    const filteredItems = React.useMemo(
        () => filterTutorialItems(items, searchValue),
        [items, searchValue],
    );

    const handleSearchUpdate = React.useCallback<QueryListSearchConfig['onUpdate']>(({value}) => {
        setSearchValue(value);
    }, []);
    const search = React.useMemo<QueryListSearchConfig>(
        () => ({
            value: searchValue,
            fullSearch: false,
            fullSearchAvailable: false,
            hasClear: true,
            onUpdate: handleSearchUpdate,
        }),
        [handleSearchUpdate, searchValue],
    );

    const handleLoadMore = React.useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    React.useEffect(() => {
        if (!searchValue || items.length === 0) {
            lastAutoLoad.current = undefined;
            return;
        }
        if (filteredItems.length > 0 || !hasNextPage || isLoading || !nextCursor) return;

        if (
            lastAutoLoad.current?.search === searchValue &&
            lastAutoLoad.current.cursor === nextCursor
        ) {
            return;
        }
        lastAutoLoad.current = {search: searchValue, cursor: nextCursor};
        handleLoadMore();
    }, [
        filteredItems.length,
        handleLoadMore,
        hasNextPage,
        isLoading,
        items.length,
        nextCursor,
        searchValue,
    ]);

    return (
        <TutorialsHistoryWidget<TutorialRow>
            className="queries-list__new-tutorials"
            title={i18n('tab_tutorials')}
            items={filteredItems}
            selectedRowId={selectedQueryId}
            search={search}
            filter={filterConfig}
            loading={isLoading}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            renderLink={renderLink}
        />
    );
}
