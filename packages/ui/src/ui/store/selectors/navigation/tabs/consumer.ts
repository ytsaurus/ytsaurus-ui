import {createSelector} from 'reselect';
import type {RootState} from '../../../../store/reducers';
import {emptyRate} from './queue';

export const getConsumerPartitionIndex = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerPartitionIndex;

export const getConsumerRateMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerRateMode;

export const getConsumerPartitionsColumns = (state: RootState) =>
    state.navigation.tabs.consumer.filters.partitionsColumns;

export const getConsumerTimeWindow = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerTimeWindow;

export const getTargetQueue = (state: RootState) =>
    state.navigation.tabs.consumer.filters.targetQueue;

export const getConsumerRegisteredQueues = (state: RootState) =>
    state.navigation.tabs.consumer.status.consumerData?.registrations;

const getStatusData = (state: RootState) => state.navigation.tabs.consumer.status.consumerData;

const getTargetQueueStatusData = (state: RootState) => {
    const statusData = getStatusData(state);
    const {queue = ''} = getTargetQueue(state) ?? {};

    return statusData?.queues?.[queue];
};

export const getOwner = (state: RootState) => getTargetQueueStatusData(state)?.owner;

export const getPartitionCount = (state: RootState) =>
    getTargetQueueStatusData(state)?.partition_count;

export const getReadDataWeightRate = (state: RootState) =>
    getTargetQueueStatusData(state)?.read_data_weight_rate ?? emptyRate;

export const getReadRowCountRate = (state: RootState) =>
    getTargetQueueStatusData(state)?.read_row_count_rate ?? emptyRate;

export const getStatusError = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusError;

export const getStatusLoading = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusLoading;

export const getStatusLoaded = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusLoaded;

export const getConsumerMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerMode;

const getPartitionsData = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsData;

export const getPartitions = createSelector(
    [getConsumerPartitionIndex, getPartitionsData],
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

export type SelectedPartition = NonNullable<ReturnType<typeof getPartitions>>[0];

export const getPartitionsError = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsError;

export const getPartitionsLoading = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsLoading;

export const getPartitionsLoaded = (state: RootState) =>
    state.navigation.tabs.consumer.partitions.partitionsLoaded;
