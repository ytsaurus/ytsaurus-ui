import type {ChangeEvent} from 'react';

import {
    CONSUMER_CHANGE_FILTERS,
    CONSUMER_MODE,
    CONSUMER_RATE_MODE,
} from '../../../../../constants/navigation/tabs/consumer';
import type {
    ConsumerFiltersAction,
    ConsumerFiltersState,
    ConsumerPartitionsColumns,
    PartitionColumn,
} from '../../../../../store/reducers/navigation/tabs/consumer/filters';
import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';

export function changeConsumerMode(evt: ChangeEvent<HTMLInputElement>): ConsumerFiltersAction {
    return {
        type: CONSUMER_CHANGE_FILTERS,
        data: {consumerMode: evt.target.value as CONSUMER_MODE},
    };
}

export function changeConsumerPartitionIndex(value: string): ConsumerFiltersAction {
    return {
        type: CONSUMER_CHANGE_FILTERS,
        data: {consumerPartitionIndex: value},
    };
}

export function changeConsumerRateMode(evt: ChangeEvent<HTMLInputElement>): ConsumerFiltersAction {
    return {
        type: CONSUMER_CHANGE_FILTERS,
        data: {consumerRateMode: evt.target.value as CONSUMER_RATE_MODE},
    };
}

interface CompactColumnSelectorPayload {
    items: Array<PartitionColumn<ConsumerPartitionsColumns>>;
}
export function changeConsumerPartitionsColumns({
    items,
}: CompactColumnSelectorPayload): ConsumerFiltersAction {
    return {
        type: CONSUMER_CHANGE_FILTERS,
        data: {partitionsColumns: items},
    };
}

export function changeConsumerTimeWindow(
    evt: ChangeEvent<HTMLInputElement>,
): ConsumerFiltersAction {
    return {
        type: CONSUMER_CHANGE_FILTERS,
        data: {consumerTimeWindow: evt.target.value as keyof TPerformanceCounters},
    };
}

export function changeConsumerFilters(data: Partial<ConsumerFiltersState>): ConsumerFiltersAction {
    return {
        type: CONSUMER_CHANGE_FILTERS,
        data,
    };
}
