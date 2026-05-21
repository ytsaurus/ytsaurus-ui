import React, {type FC} from 'react';
import {Flex, type ListItemData} from '@gravity-ui/uikit';
import {type QueryHistoryListColumn, type TableItem, isHeaderTableItem} from '../Columns/columns';
import {RoutedLink} from '../../../../../containers/RoutedLink/RoutedLink';
import {useQueryItemUrl} from '../../../hooks/Query/useQueryItemUrl';
import cn from 'bem-cn-lite';
import './HistoryListRow.scss';

type Props = {
    item: ListItemData<TableItem>;
    columns: QueryHistoryListColumn[];
};

const b = cn('yt-queries-history-row');

export const HistoryListRow: FC<Props> = ({item, columns}) => {
    const getQueryUrl = useQueryItemUrl();

    if (isHeaderTableItem(item)) {
        return (
            <Flex alignItems="center" justifyContent="center" className={b('date-header')}>
                {item.header}
            </Flex>
        );
    }

    const href = getQueryUrl(item);

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
