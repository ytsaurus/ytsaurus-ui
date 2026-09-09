import React from 'react';
import cn from 'bem-cn-lite';

import {
    CompactColumnSelector,
    timeItems,
} from '../../../../Consumer/views/Partitions/PartitionsExtraControls';
import Filter from '../../../../../../../components/Filter/Filter';
import RadioButton from '../../../../../../../components/RadioButton/RadioButton';
import {QUEUE_RATE_MODE} from '../../../../../../../constants/navigation/tabs/queue';
import {type PartitionColumn} from '../../../../../../../store/reducers/navigation/tabs/consumer/filters';
import {type QueuePartitionsColumns} from '../../../../../../../store/reducers/navigation/tabs/queue/filters';
import {type TPerformanceCounters} from '../../../../../../../store/reducers/navigation/tabs/queue/types';
import i18n from '../i18n';

const block = cn('queue-partitions');

interface Props extends PropsFromRedux {}

const rateItems: React.ComponentProps<typeof RadioButton>['items'] = [
    {
        value: QUEUE_RATE_MODE.ROWS,
        get text() {
            return i18n('value_rows');
        },
    },
    {
        value: QUEUE_RATE_MODE.DATA_WEIGHT,
        get text() {
            return i18n('value_data-weight');
        },
    },
];

export const PartitionsExtraControlsBase: React.VFC<Props> = ({
    queuePartitionIndex,
    queueTabletCellHost,
    queueTabletCellId,
    queueRateMode,
    queueTimeWindow,
    queuePartitionsColumns,
    changeQueuePartitionIndex,
    changeQueueTabletCellHost,
    changeQueueTabletCellId,
    changeQueueRateMode,
    changeQueueTimeWindow,
    changeQueuePartitionsColumns,
}) => {
    return (
        <>
            <div className={block('divider')} />
            <Filter
                className={block('filter')}
                value={queuePartitionIndex}
                onChange={changeQueuePartitionIndex}
                placeholder={i18n('field_partition-index')}
            />
            <Filter
                className={block('filter')}
                value={queueTabletCellHost}
                onChange={changeQueueTabletCellHost}
                placeholder={i18n('field_tablet-cell-host')}
            />
            <Filter
                className={block('filter')}
                value={queueTabletCellId}
                onChange={changeQueueTabletCellId}
                placeholder={i18n('field_tablet-cell-id')}
            />
            <div className={block('divider')} />
            <RadioButton value={queueRateMode} onChange={changeQueueRateMode} items={rateItems} />
            <RadioButton
                value={queueTimeWindow}
                onChange={changeQueueTimeWindow}
                items={timeItems}
            />
            <CompactColumnSelector
                items={queuePartitionsColumns}
                onChange={changeQueuePartitionsColumns}
            />
        </>
    );
};
type PropsFromRedux = {
    queuePartitionIndex: string;
    queueTabletCellHost: string;
    queueTabletCellId: string;
    queueRateMode: QUEUE_RATE_MODE;
    queueTimeWindow: keyof TPerformanceCounters;
    queuePartitionsColumns: PartitionColumn<QueuePartitionsColumns>[];
    changeQueuePartitionIndex: (value: string) => void;
    changeQueueTabletCellHost: (value: string) => void;
    changeQueueTabletCellId: (value: string) => void;
    changeQueueRateMode: (evt: React.ChangeEvent<HTMLInputElement>) => void;
    changeQueueTimeWindow: (evt: React.ChangeEvent<HTMLInputElement>) => void;
    changeQueuePartitionsColumns(data: {
        items: Array<PartitionColumn<QueuePartitionsColumns>>;
    }): void;
};
