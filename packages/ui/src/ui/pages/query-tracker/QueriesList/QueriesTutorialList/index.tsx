import React, {useMemo} from 'react';
import cn from 'bem-cn-lite';
import {Icon, Text, List, ListItemData, Loader} from '@gravity-ui/uikit';
import {QueryItem} from '../../module/api';
import {useQueryList} from '../../hooks/QueriesList';
import {useQueryNavigation} from '../../hooks/Query';
import tutorialIcon from '../../../../../../img/svg/learn.svg';
import './index.scss';

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
    const [items, isLoading] = useQueryList();

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
