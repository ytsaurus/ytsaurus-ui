import React, {type FC} from 'react';
import {type ListItemData} from '@gravity-ui/uikit';
import type {QueryHistoryListColumn} from '../Columns/columns';
import {type QueryItem} from '../../../../../types/query-tracker/api';
import {useQueryItemUrl} from '../../../hooks/Query/useQueryItemUrl';
import {RoutedLink} from '../../../../../containers/RoutedLink/RoutedLink';
import cn from 'bem-cn-lite';
import './QueryHistoryItemRow.scss';

const b = cn('yt-queries-history-item-row');

type Props = {
    item: ListItemData<QueryItem>;
    columns: QueryHistoryListColumn[];
};

export const QueryHistoryItemRow: FC<Props> = ({item, columns}) => {
    const href = useQueryItemUrl(item);

    return (
        <RoutedLink className={b()} href={href} disablePreserveLocation>
            {columns.map((column) => {
                return (
                    <div
                        key={column.name}
                        className={b('cell')}
                        style={{flex: `1 0 ${column.baseWidth}px`}}
                    >
                        {column.render(item)}
                    </div>
                );
            })}
        </RoutedLink>
    );
};
