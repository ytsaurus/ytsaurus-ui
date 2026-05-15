import {createSelector} from 'reselect';

import {type RootState} from '../../../reducers';
import {type YtQueueStatus} from '../../../reducers/navigation/tabs/queue/types';

export const emptyRate = {'1m': 0, '1h': 0, '1d': 0};

export const selectFamily = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.family;

export const selectPartitionCount = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.partition_count;

export const selectReadDataWeightRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.read_data_weight_rate ?? emptyRate;

export const selectReadRowCountRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.read_row_count_rate ?? emptyRate;

export const selectWriteDataWeightRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.write_data_weight_rate ?? emptyRate;

export const selectWriteRowCountRate = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.write_row_count_rate ?? emptyRate;

export const selectStatusError = (state: RootState) =>
    state.navigation.tabs.queue.status.statusError;

export const selectStatusLoading = (state: RootState) =>
    state.navigation.tabs.queue.status.statusLoading;

export const selectStatusLoaded = (state: RootState) =>
    state.navigation.tabs.queue.status.statusLoaded;

export const selectQueueStatusDataAlerts = (state: RootState): YtQueueStatus['alerts'] =>
    state.navigation.tabs.queue.status?.statusData?.alerts;

export const selectQueueMode = (state: RootState) => state.navigation.tabs.queue.filters.queueMode;

export const selectQueuePartitionIndex = (state: RootState) =>
    state.navigation.tabs.queue.filters.queuePartitionIndex;

export const selectQueuePartitionsColumns = (state: RootState) =>
    state.navigation.tabs.queue.filters.partitionsColumns;

export const selectQueueTabletCellHost = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueTabletCellHost;

export const selectQueueTabletCellId = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueTabletCellId;

export const selectQueueConsumerName = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueConsumerName;

export const selectQueueOwner = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueOwner;

export const selectQueueRateMode = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueRateMode;

export const selectQueueTimeWindow = (state: RootState) =>
    state.navigation.tabs.queue.filters.queueTimeWindow;

const selectPartitionsData = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsData;

export const selectPartitions = createSelector(
    [
        selectQueuePartitionIndex,
        selectQueueTabletCellHost,
        selectQueueTabletCellId,
        selectPartitionsData,
    ],
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

export type SelectedPartition = NonNullable<ReturnType<typeof selectPartitions>>[0];

export const selectPartitionsError = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsError;

export const selectPartitionsLoading = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsLoading;

export const selectPartitionsLoaded = (state: RootState) =>
    state.navigation.tabs.queue.partitions.partitionsLoaded;

const selectRawConsumers = (state: RootState) =>
    state.navigation.tabs.queue.status.statusData?.registrations;

export const selectConsumers = createSelector(
    [selectQueueConsumerName, selectRawConsumers],
    (queueConsumerName, consumers) =>
        (consumers ? consumers : [])
            ?.map((consumer) => ({
                ...consumer,
                read_data_weight_rate: emptyRate,
                read_row_count_rate: emptyRate,
            }))
            ?.filter((item) => item.consumer.includes(queueConsumerName)),
);

export type SelectedConsumer = NonNullable<ReturnType<typeof selectConsumers>>[0];
