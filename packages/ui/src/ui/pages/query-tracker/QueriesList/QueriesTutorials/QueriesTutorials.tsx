import React from 'react';
import cn from 'bem-cn-lite';
import {
    HistoryGroupHeader,
    type QueryListLinkRenderer,
    type QueryListRowRenderData,
    type QueryListSearchConfig,
    RowLink,
    TutorialsHistory as TutorialsHistoryWidget,
} from '@gravity-ui/querieskit';
import {Icon, Text} from '@gravity-ui/uikit';

import tutorialIcon from '../../../../assets/img/svg/learn.svg';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {loadNextQueriesList} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import {selectCluster} from '../../../../store/selectors/global';
import {
    selectHasNextPage,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectTutorialQueriesList,
} from '../../../../store/selectors/query-tracker/queriesList';
import {selectQuery} from '../../../../store/selectors/query-tracker/query';
import i18n from '../i18n';
import {filterTutorialItems, prepareTutorialItems} from './helpers';
import {type TutorialRow} from './types';
import {useTutorialsFilters} from './useTutorialsFilters';

import './QueriesTutorials.scss';

const block = cn('queries-tutorials');

const renderLink: QueryListLinkRenderer = (props) => (
    <RoutedLink {...props} href={props.href ?? ''} disablePreserveLocation />
);

function renderTutorialRow({item, renderLink: renderRowLink}: QueryListRowRenderData<TutorialRow>) {
    if ('header' in item) {
        return <HistoryGroupHeader title={item.header} />;
    }

    return (
        <RowLink href={item.href} renderLink={renderRowLink} className={block('row-link')}>
            <Icon className={block('row-icon')} data={tutorialIcon} />
            <Text ellipsis title={item.title} color="primary">
                {item.title}
            </Text>
        </RowLink>
    );
}

export function QueriesTutorials() {
    const dispatch = useDispatch();
    const cluster = useSelector(selectCluster);
    const queries = useSelector(selectTutorialQueriesList);
    const filter = useSelector(selectQueriesFilters);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasNextPage = useSelector(selectHasNextPage);
    const selectedQueryId = useSelector(selectQuery)?.id;
    const [searchValue, setSearchValue] = React.useState('');
    const {config: filterConfig, formKey} = useTutorialsFilters(filter);

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
        if (
            searchValue &&
            items.length > 0 &&
            filteredItems.length === 0 &&
            hasNextPage &&
            !isLoading
        ) {
            handleLoadMore();
        }
    }, [filteredItems.length, handleLoadMore, hasNextPage, isLoading, items.length, searchValue]);

    return (
        <TutorialsHistoryWidget<TutorialRow>
            key={formKey}
            className="queries-list__new-tutorials"
            title={i18n('tab_tutorials')}
            items={filteredItems}
            selectedRowId={selectedQueryId}
            search={search}
            filter={filterConfig}
            renderRowItem={renderTutorialRow}
            loading={isLoading}
            hasMore={hasNextPage}
            onLoadMore={handleLoadMore}
            renderLink={renderLink}
        />
    );
}
