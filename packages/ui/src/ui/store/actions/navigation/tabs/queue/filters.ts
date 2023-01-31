import type {ChangeEvent} from 'react';

import {
    QUEUE_CHANGE_PARTITIONS_COLUMNS,
    QUEUE_CHANGE_PERSISTED_STATE,
    QUEUE_MODE,
    QUEUE_RATE_MODE,
} from '../../../../../constants/navigation/tabs/queue';
import type {
    QueueFiltersAction,
    QueuePartitionsColumns,
} from '../../../../../store/reducers/navigation/tabs/queue/filters';
import {PartitionColumn} from '../../../../reducers/navigation/tabs/consumer/filters';
import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';

export function changeQueueMode(evt: ChangeEvent<HTMLInputElement>): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueMode: evt.target.value as QUEUE_MODE},
    };
}

export function changeQueuePartitionIndex(value: string): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queuePartitionIndex: value},
    };
}

export function changeQueueTabletCellHost(value: string): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueTabletCellHost: value},
    };
}

export function changeQueueTabletCellId(value: string): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueTabletCellId: value},
    };
}

export function changeQueueConsumerName(value: string): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueConsumerName: value},
    };
}

export function changeQueueOwner(value: string): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueOwner: value},
    };
}

export function changeQueueRateMode(evt: ChangeEvent<HTMLInputElement>): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueRateMode: evt.target.value as QUEUE_RATE_MODE},
    };
}

export function changeQueueTimeWindow(evt: ChangeEvent<HTMLInputElement>): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PERSISTED_STATE,
        data: {queueTimeWindow: evt.target.value as keyof TPerformanceCounters},
    };
}

interface CompactColumnSelectorPayload {
    items: Array<PartitionColumn<QueuePartitionsColumns>>;
}
export function changeQueuePartitionsColumns({
    items,
}: CompactColumnSelectorPayload): QueueFiltersAction {
    return {
        type: QUEUE_CHANGE_PARTITIONS_COLUMNS,
        data: {partitionsColumns: items},
    };
}
