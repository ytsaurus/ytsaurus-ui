import {createSelector} from 'reselect';
import type {RootState} from '../../../../store/reducers';
import {emptyRate} from './queue';

export const getTargetQueue = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusData?.target_queue;

export const getOwner = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusData?.owner;

export const getVital = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusData?.vital;

export const getPartitionCount = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusData?.partition_count;

export const getReadDataWeightRate = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusData?.read_data_weight_rate ?? emptyRate;

export const getReadRowCountRate = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusData?.read_row_count_rate ?? emptyRate;

export const getStatusError = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusError;

export const getStatusLoading = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusLoading;

export const getStatusLoaded = (state: RootState) =>
    state.navigation.tabs.consumer.status.statusLoaded;

export const getConsumerMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerMode;

export const getConsumerPartitionIndex = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerPartitionIndex;

export const getConsumerRateMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerRateMode;

export const getConsumerPartitionsColumns = (state: RootState) =>
    state.navigation.tabs.consumer.filters.partitionsColumns;

export const getConsumerTimeWindow = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerTimeWindow;

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
