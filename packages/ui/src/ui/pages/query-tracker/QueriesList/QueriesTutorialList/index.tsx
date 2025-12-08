import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Icon, List, ListItemData, Text} from '@gravity-ui/uikit';
import {QueryItem} from '../../../../types/query-tracker/api';
import {useQueryNavigation} from '../../hooks/Query';
import tutorialIcon from '../../../../assets/img/svg/learn.svg';
import './index.scss';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    getTutorialQueriesList,
    hasQueriesListMore,
    isQueriesListLoading,
} from '../../../../store/selectors/query-tracker/queriesList';
import {loadNextQueriesList} from '../../../../store/actions/query-tracker/queriesList';
import {InfiniteScrollLoader} from '../../../../components/InfiniteScrollLoader';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import i18n from './i18n';

const itemCn = cn('query-tutorial-item');
const block = cn('queries-tutorial-list');

function renderItem(item: QueryItem) {
    return (
        <>
            <Icon className={itemCn('icon')} data={tutorialIcon} />
            <Text className={itemCn('text')} ellipsis title={item?.annotations?.title}>
                {item?.annotations?.title || i18n('field_no-name')}
            </Text>
        </>
    );
}

export function QueriesTutorialList({className}: {className: string}) {
    const dispatch = useDispatch();
    const items = useSelector(getTutorialQueriesList);
    const isLoading = useSelector(isQueriesListLoading);
    const hasMore = useSelector(hasQueriesListMore);

    const [selectedId, goToQuery] = useQueryNavigation();

    const showPagination = hasMore && items.length > 0;

    const handleLoadMore = () => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    };

    const selectedIndex = useMemo(() => {
        return items.findIndex((query) => query.id === selectedId);
    }, [selectedId, items]);

    const tutorialFilter = useMemo(() => {
        return (filter: string) => {
            return (item: ListItemData<QueryItem>) => {
                return (
                    item?.annotations?.title
                        ?.toLocaleLowerCase()
                        .includes(filter.toLocaleLowerCase()) || false
                );
            };
        };
    }, []);

    return (
        <div className={block(null, className)}>
            <List
                className={block('list', {loading: isLoading})}
                filterable={true}
                filterClassName={block('filter')}
                filterPlaceholder={i18n('context_filter-by-name')}
                filterItem={tutorialFilter}
                virtualized={false}
                selectedItemIndex={selectedIndex}
                sortable={false}
                itemHeight={32}
                itemClassName={itemCn()}
                items={isLoading ? [] : items}
                renderItem={renderItem}
                onItemClick={goToQuery}
            />
            {showPagination && (
                <InfiniteScrollLoader
                    className={block('pagination')}
                    loading={isLoading}
                    onLoadMore={handleLoadMore}
                />
            )}
        </div>
    );
}
