import React, {type FC} from 'react';
import {Flex, List, Loader} from '@gravity-ui/uikit';
import {useSelector} from '../../../../../store/redux-hooks';
import {
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectQueriesList,
} from '../../../../../store/selectors/query-tracker/queriesList';
import {FullTextSearchItem} from '../FullTextSearchItem';
import {prepareFullTextSearchItems} from '../helpers/prepareFullTextSearchItems';
import {useQueryNavigation} from '../../../hooks/Query';
import {NoContent} from '@ytsaurus/components';
import block from 'bem-cn-lite';
import './FullTextSearch.scss';
import i18n from './i18n';

const b = block('yt-queries-full-text-search');
const LIST_ITEM_HEIGHT = 162;
const MAX_PREVIEW_LINES = 4;

export const FullTextSearch: FC = () => {
    const {filter} = useSelector(selectQueriesFilters);
    const items = useSelector(selectQueriesList);
    const isLoading = useSelector(selectIsQueriesListLoading);
    const [, goToQuery] = useQueryNavigation();

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
            renderItem={(item) => {
                return (
                    <FullTextSearchItem
                        key={item.id}
                        item={item}
                        maxPreviewLines={MAX_PREVIEW_LINES}
                    />
                );
            }}
            onItemClick={(item) => {
                goToQuery(item);
            }}
        />
    );
};
