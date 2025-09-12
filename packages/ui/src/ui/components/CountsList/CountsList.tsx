import React from 'react';
import block from 'bem-cn-lite';

import map_ from 'lodash/map';
import orderBy_ from 'lodash/orderBy';
import reduce_ from 'lodash/reduce';
import slice_ from 'lodash/slice';

import i18n from './i18n';
import './CountsList.scss';

const b = block('counts-list');
const DISPLAYED_ITEMS = 3;

export interface CountsListInfo {
    type: string;
    count: number;
}

export interface CountsListProps {
    items: CountsListInfo[];
    hideAll?: boolean;
    selectedItems?: unknown[];
    renderActions?: () => React.ReactNode;
}

function prepareItems(items: CountsListInfo[]): CountsListInfo[] {
    const sortedItems = orderBy_(items, (node) => node.count, 'desc');
    return slice_(sortedItems, 0, DISPLAYED_ITEMS);
}

function getSumCount(nodes: CountsListInfo[]): number {
    return reduce_(nodes, (sum, node) => sum + node.count, 0);
}

function renderItem(node: CountsListInfo): React.ReactElement {
    return (
        <li className={b('item')} key={node.type}>
            <span className={b('type')}>{node.type}</span>
            <span className={b('count')}>{node.count}</span>
        </li>
    );
}

function renderItems(nodes: CountsListInfo[]): React.ReactElement[] {
    return map_(nodes, (node) => renderItem(node));
}

function SelectedItems({
    selectedItems,
    renderActions,
}: Pick<CountsListProps, 'selectedItems' | 'renderActions'>) {
    if (!selectedItems?.length) {
        return null;
    }
    return (
        <li className={b('item')}>
            <span className={b('type')}>{i18n('selected')}</span>
            <span className={b('count')}>{selectedItems.length}</span>
            <span className={b('actions')}>{renderActions?.()}</span>
        </li>
    );
}

export function CountsList({hideAll, items, selectedItems, renderActions}: CountsListProps) {
    const displayedItems = prepareItems(items);
    const allItemsCount = getSumCount(items);
    const displayedItemsCount = getSumCount(displayedItems);
    const otherItemsCount = allItemsCount - displayedItemsCount;

    return (
        <ul className={b('list')}>
            {!hideAll && renderItem({type: i18n('all'), count: allItemsCount})}
            {renderItems(displayedItems)}
            {!hideAll &&
                otherItemsCount > 0 &&
                renderItem({type: i18n('other'), count: otherItemsCount})}
            <SelectedItems selectedItems={selectedItems} renderActions={renderActions} />
        </ul>
    );
}

export default CountsList;
