import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Icon, List, type ListItemData, Text} from '@gravity-ui/uikit';
import {type QueryItem} from '../../../../types/query-tracker/api';
import tutorialIcon from '../../../../assets/img/svg/learn.svg';
import './index.scss';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectHasQueriesListMore,
    selectIsQueriesListLoading,
    selectTutorialQueriesList,
} from '../../../../store/selectors/query-tracker/queriesList';
import {selectQuery} from '../../../../store/selectors/query-tracker/query';
import {loadNextQueriesList} from '../../../../store/actions/query-tracker/queriesList';
import {InfiniteScrollLoader} from '../../../../components/InfiniteScrollLoader';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import i18n from './i18n';
import {QueryItemLink} from '../QueryItemLink/QueryItemLink';

const itemCn = cn('query-tutorial-item');
const block = cn('queries-tutorial-list');

function renderItem(item: QueryItem) {
    return (
        <QueryItemLink item={item} className={itemCn('link')}>
            <Icon className={itemCn('icon')} data={tutorialIcon} />
            <Text
                className={itemCn('text')}
                ellipsis
                title={item?.annotations?.title}
                color="primary"
            >
                {item?.annotations?.title || i18n('field_no-name')}
            </Text>
        </QueryItemLink>
    );
}

export function QueriesTutorialList({className}: {className: string}) {
    const dispatch = useDispatch();
    const items = useSelector(selectTutorialQueriesList);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasMore = useSelector(selectHasQueriesListMore);

    const selectedId = useSelector(selectQuery)?.id;

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
