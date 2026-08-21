import React, {type FC, useCallback} from 'react';
import {Flex, List, Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectHasNextPage,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectQueriesList,
} from '../../../../../store/selectors/query-tracker/queriesList';
import {FullTextSearchItem} from '../FullTextSearchItem';
import {prepareFullTextSearchItems} from '../helpers/prepareFullTextSearchItems';
import {NoContent} from '@ytsaurus/components';
import block from 'bem-cn-lite';
import './FullTextSearch.scss';
import i18n from './i18n';
import {loadNextQueriesList} from '../../../../../store/actions/query-tracker/queriesList';
import {QueriesHistoryCursorDirection} from '../../../../../store/reducers/query-tracker/query-tracker-contants';

const b = block('yt-queries-full-text-search');
const LIST_ITEM_HEIGHT = 162;
const MAX_PREVIEW_LINES = 4;

export const FullTextSearch: FC = () => {
    const dispatch = useDispatch();
    const {filter} = useSelector(selectQueriesFilters);
    const items = useSelector(selectQueriesList);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasNextPage = useSelector(selectHasNextPage);

    const handleLoadMore = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    if (isLoading && !items.length) {
        return (
            <Flex alignItems="center" justifyContent="center" className={b('no-content')}>
                <Loader />
            </Flex>
        );
    }

    if (!items.length) {
        return (
            <Flex alignItems="center" justifyContent="center" className={b('no-content')}>
                <NoContent
                    vertical
                    warning={i18n('title_fulltext-search-empty')}
                    hint={i18n('context_fulltext-search-empty-hint')}
                />
            </Flex>
        );
    }

    return (
        <List
            itemHeight={LIST_ITEM_HEIGHT}
            itemsHeight={items.length * LIST_ITEM_HEIGHT}
            filterable={false}
            items={prepareFullTextSearchItems({items, filter, maxLines: MAX_PREVIEW_LINES})}
            loading={hasNextPage}
            onLoadMore={hasNextPage ? handleLoadMore : undefined}
            renderItem={(item) => {
                return (
                    <FullTextSearchItem
                        key={item.id}
                        item={item}
                        maxPreviewLines={MAX_PREVIEW_LINES}
                    />
                );
            }}
        />
    );
};
