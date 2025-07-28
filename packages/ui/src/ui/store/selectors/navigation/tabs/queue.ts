import {createSelector} from 'reselect';

import type {RootState} from '../../../reducers';
import type {YtQueueStatus} from '../../../reducers/navigation/tabs/queue/types';

export const emptyRate = {'1m': 0, '1h': 0, '1d': 0};

export const getFamily = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.family;

export const getPartitionCount = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.partition_count;

export const getReadDataWeightRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.read_data_weight_rate ?? emptyRate;

export const getReadRowCountRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.read_row_count_rate ?? emptyRate;

export const getWriteDataWeightRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.write_data_weight_rate ?? emptyRate;

export const getWriteRowCountRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.write_row_count_rate ?? emptyRate;

export const getStatusError = (state: RootState) => state.navigation.tabs.queue.status.statusError;

export const getStatusLoading = (state: RootState) =>
    state.navigation.tabs.queue.status.statusLoading;

export const getStatusLoaded = (state: RootState) =>
    state.navigation.tabs.queue.status.statusLoaded;

export const getQueueStatusDataAlerts = (state: RootState): YtQueueStatus['alerts'] =>
    state.navigation.tabs.queue.status?.statusData?.alerts;

export const getQueueMode = (state: RootState) => state.navigation.tabs.queue.filters.queueMode;

export const getQueuePartitionIndex = (state: RootState) =>
    state.navigation.tabs.queue.filters.queuePartitionIndex;

export const getQueuePartitionsColumns = (state: RootState) =>
    state.navigation.tabs.queue.filters.partitionsColumns;

export const getQueueTabletCellHost = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueTabletCellHost;

export const getQueueTabletCellId = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueTabletCellId;

export const getQueueConsumerName = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueConsumerName;

export const getQueueOwner = (state: RootState) => state.navigation.tabs.queue.filters.queueOwner;

export const getQueueRateMode = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueRateMode;

export const getQueueTimeWindow = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueTimeWindow;

const getPartitionsData = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsData;

export const getPartitions = createSelector(
    [getQueuePartitionIndex, getQueueTabletCellHost, getQueueTabletCellId, getPartitionsData],
    (queuePartitionIndex, queueTabletCellHost, queueTabletCellId, partitionsData) =>
        partitionsData
            ?.map((partition, index) => ({
                ...partition,
                meta: partition.meta,
                partition_index: index,
                write_data_weight_rate: partition.write_data_weight_rate ?? emptyRate,
                write_row_count_rate: partition.write_row_count_rate ?? emptyRate,
            }))
            ?.filter(
                (partition) =>
                    partition.partition_index.toString(10).includes(queuePartitionIndex) &&
                    partition?.meta?.host?.includes?.(queueTabletCellHost) &&
                    partition?.meta?.cell_id?.includes?.(queueTabletCellId),
            ) ?? [],
);

export type SelectedPartition = NonNullable<ReturnType<typeof getPartitions>>[0];

export const getPartitionsError = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsError;

export const getPartitionsLoading = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsLoading;

export const getPartitionsLoaded = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsLoaded;

const getRawConsumers = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.registrations;

export const getConsumers = createSelector(
    [getQueueConsumerName, getRawConsumers],
    (queueConsumerName, consumers) =>
        (consumers ? consumers : [])
            ?.map((consumer) => ({
                ...consumer,
                read_data_weight_rate: emptyRate,
                read_row_count_rate: emptyRate,
            }))
            ?.filter((item) => item.consumer.includes(queueConsumerName)),
);

export type SelectedConsumer = NonNullable<ReturnType<typeof getConsumers>>[0];
