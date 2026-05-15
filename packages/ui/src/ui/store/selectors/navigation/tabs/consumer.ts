import {createSelector} from 'reselect';
import {type RootState} from '../../../../store/reducers';
import {emptyRate} from './queue';

export const selectConsumerPartitionIndex = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerPartitionIndex;

export const selectConsumerRateMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerRateMode;

export const selectConsumerPartitionsColumns = (state: RootState) =>
    state.navigation.tabs.consumer.filters.partitionsColumns;

export const selectConsumerTimeWindow = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerTimeWindow;

export const selectTargetQueue = (state: RootState) =>
    state.navigation.tabs.consumer.filters.targetQueue;

export const selectConsumerRegisteredQueues = (state: RootState) =>
    state.navigation.tabs.consumer.status.consumerData?.registrations;

const selectStatusData = (state: RootState) => state.navigation.tabs.consumer.status.consumerData;

const selectTargetQueueStatusData = (state: RootState) => {
    const statusData = selectStatusData(state);
    const {queue = ''} = selectTargetQueue(state) ?? {};

    return statusData?.queues?.[queue];
};

export const selectOwner = (state: RootState) => selectTargetQueueStatusData(state)?.owner;

export const selectPartitionCount = (state: RootState) =>
    selectTargetQueueStatusData(state)?.partition_count;

export const selectReadDataWeightRate = (state: RootState) =>
    selectTargetQueueStatusData(state)?.read_data_weight_rate ?? emptyRate;

export const selectReadRowCountRate = (state: RootState) =>
    selectTargetQueueStatusData(state)?.read_row_count_rate ?? emptyRate;

export const selectTargetQueueError = (state: RootState) => {
    const targetQueueStatusData = selectTargetQueueStatusData(state);
    return targetQueueStatusData?.error;
};

export const selectStatusError = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusError;

export const selectStatusLoading = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusLoading;

export const selectStatusLoaded = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusLoaded;

export const selectConsumerMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerMode;

const selectPartitionsData = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsData;

export const selectPartitions = createSelector(
    [selectConsumerPartitionIndex, selectPartitionsData],
    (consumerPartitionIndex, partitionsData) =>
        partitionsData
            ?.map((partition, index) => ({
                ...partition,
                partition_index: index,
                read_data_weight_rate: partition.read_data_weight_rate ?? emptyRate,
                read_row_count_rate: partition.read_row_count_rate ?? emptyRate,
            }))
            ?.filter((partition) =>
                partition.partition_index.toString(10).includes(consumerPartitionIndex),
            ) ?? [],
);

export type SelectedPartition = NonNullable<ReturnType<typeof selectPartitions>>[0];

export const selectPartitionsError = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsError;

export const selectPartitionsLoading = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsLoading;

export const selectPartitionsLoaded = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsLoaded;
