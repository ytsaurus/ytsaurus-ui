import React, {type FC, useCallback} from 'react';
import {List} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {
    selectHasNextPage,
    selectHasQueriesListLoaded,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectQueriesList,
} from '../../../../../store/selectors/query-tracker/queriesList';
import {FullTextSearchItem} from '../FullTextSearchItem';
import {prepareFullTextSearchItems} from '../../helpers/prepareFullTextSearchItems';
import {QueriesListPlaceholder} from '../QueriesListPlaceholder/QueriesListPlaceholder';
import {loadNextQueriesList} from '../../../../../store/actions/query-tracker/queriesList';
import {QueriesHistoryCursorDirection} from '../../../../../store/reducers/query-tracker/query-tracker-contants';

const LIST_ITEM_HEIGHT = 162;
const MAX_PREVIEW_LINES = 4;

export const FullTextSearch: FC = () => {
    const dispatch = useDispatch();
    const {filter} = useSelector(selectQueriesFilters);
    const items = useSelector(selectQueriesList);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const hasLoaded = useSelector(selectHasQueriesListLoaded);
    const hasNextPage = useSelector(selectHasNextPage);

    const handleLoadMore = useCallback(() => {
        dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
    }, [dispatch]);

    if (!items.length) {
        return <QueriesListPlaceholder loading={isLoading} hasLoaded={hasLoaded} />;
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
