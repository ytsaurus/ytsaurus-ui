import {SortIndicatorProps} from '@gravity-ui/table';
import {Icon} from '@gravity-ui/uikit';
import React from 'react';
import {CaretDown, CaretUp, CaretsExpandVertical} from '@gravity-ui/icons';
import {Tooltip} from '../../components/Tooltip/Tooltip';

function getIcon(order?: 'asc' | 'desc' | boolean) {
    switch (order) {
        case 'asc':
            return CaretUp;
        case 'desc':
            return CaretDown;
        default:
            return CaretsExpandVertical;
    }
}

export function YTSortIndicator<TData, TValue>({header}: SortIndicatorProps<TData, TValue>) {
    const order = header.column.getIsSorted();
    //const nextOrder = header.column.getNextSortingOrder();

    const allowSort = header.column.getCanSort();
    const sortIcon = allowSort ? getIcon(order) : null;

    return sortIcon ? (
        <Tooltip content="">
            <Icon data={sortIcon} size={16} />
        </Tooltip>
    ) : null;
}
