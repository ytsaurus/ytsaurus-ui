import {CaretDown, CaretUp, CaretsExpandVertical} from '@gravity-ui/icons';
import {SortIndicatorProps} from '@gravity-ui/table';
import {Icon} from '@gravity-ui/uikit';
import React from 'react';
import format from '../../common/hammer/format';
import {Tooltip} from '@ytsaurus/components';

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

    const allowSort = header.column.getCanSort();
    const sortIcon = allowSort ? getIcon(order) : null;

    return sortIcon ? (
        <Tooltip content={order ? format.ReadableField(order) : null}>
            <Icon data={sortIcon} size={16} />
        </Tooltip>
    ) : null;
}
