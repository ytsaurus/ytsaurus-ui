import React, {type FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './HistoryListHeader.scss';
import {type QueryHistoryListColumn} from '../Columns/columns';

const b = cn('yt-queries-history-list-header');

type Props = {
    columns: QueryHistoryListColumn[];
};

export const HistoryListHeader: FC<Props> = ({columns}) => {
    return (
        <Flex className={b()}>
            {columns.map((column) => (
                <div
                    key={column.name}
                    className={b('item')}
                    style={{flex: `1 0 ${column.baseWidth}px`}}
                >
                    {column.name}
                </div>
            ))}
        </Flex>
    );
};
