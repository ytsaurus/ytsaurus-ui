import React, {type FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import {
    QueryHistoryDurationCell,
    QueryHistoryNameCell,
    QueryHistoryStartedCell,
} from './Columns/ColumnCells';
import {type QueryItem} from '../../../../types/query-tracker/api';
import block from 'bem-cn-lite';
import './FullTextSearchItem.scss';
import {QueryPreviewMonaco} from './QueryPreviewMonaco';

const b = block('yt-queries-full-text-search-item');

type Props = {
    item: QueryItem;
    maxPreviewLines: number;
};

export const FullTextSearchItem: FC<Props> = ({item, maxPreviewLines}) => {
    const query = item?.query ?? '';

    return (
        <Flex direction="column" gap={2} className={b()}>
            <Flex justifyContent="space-between">
                <QueryHistoryNameCell row={item} />

                <Flex gap={1}>
                    <QueryHistoryDurationCell row={item} />
                    <QueryHistoryStartedCell row={item} />
                </Flex>
            </Flex>

            <QueryPreviewMonaco
                className={b('monaco')}
                value={query}
                engine={item.engine}
                maxPreviewLines={maxPreviewLines}
                previewFirstLineNumber={item.queryPreviewLineNumberStart ?? 1}
            />
        </Flex>
    );
};
