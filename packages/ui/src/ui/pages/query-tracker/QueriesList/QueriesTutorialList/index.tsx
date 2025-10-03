import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Icon, List, ListItemData, Loader, Text} from '@gravity-ui/uikit';
import {QueryItem} from '../../../../types/query-tracker/api';
import {useQueryNavigation} from '../../hooks/Query';
import tutorialIcon from '../../../../assets/img/svg/learn.svg';
import './index.scss';
import {useSelector} from 'react-redux';
import {
    getQueriesList,
    isQueriesListLoading,
} from '../../../../store/selectors/queries/queriesList';

const itemCn = cn('query-tutorial-item');
const block = cn('queries-tutorial-list');

function renderItem(item: QueryItem) {
    return (
        <>
            <Icon className={itemCn('icon')} data={tutorialIcon} />
            <Text className={itemCn('text')} ellipsis title={item?.annotations?.title}>
                {item?.annotations?.title || 'No name'}
            </Text>
        </>
    );
}

export function QueriesTutorialList({className}: {className: string}) {
    const items = useSelector(getQueriesList);
    const isLoading = useSelector(isQueriesListLoading);

    const [selectedId, goToQuery] = useQueryNavigation();

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
                filterPlaceholder={'Filter by name'}
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
            {isLoading && (
                <div className={block('loader')}>
                    <Loader size="l" />
                </div>
            )}
        </div>
    );
}
