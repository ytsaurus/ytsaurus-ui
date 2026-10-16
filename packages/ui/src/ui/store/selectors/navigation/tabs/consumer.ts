import {createSelector} from 'reselect';
import {type RootState} from '../../../../store/reducers';
import {emptyRate} from './queue';
import {selectPath, selectTransaction} from '..';
import {selectCluster} from '../../global';

export const selectConsumerPartitionIndex = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerPartitionIndex;

export const selectConsumerRateMode = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerRateMode;

export const selectConsumerPartitionsColumns = (state: RootState) =>
    state.navigation.tabs.consumer.filters.partitionsColumns;

export const selectConsumerTimeWindow = (state: RootState) =>
    state.navigation.tabs.consumer.filters.consumerTimeWindow;

export const selectConsumerNames = (state: RootState) =>
    state.navigation.tabs.consumer.status.consumerData?.queue_consumer_names;

export const selectConsumerName = (state: RootState) => {
    const names = selectConsumerNames(state);
    const name = state.navigation.tabs.consumer.filters.consumerName;
    return name !== undefined && names?.includes(name) ? name : names?.[0];
};

const selectStatusData = (state: RootState) => {
    const data = state.navigation.tabs.consumer.status.consumerData;
    const name = selectConsumerName(state);
    if (data?.queue_consumer_names === undefined) return data;
    return name === undefined ? undefined : data.consumers?.[name];
};

export const selectConsumerError = (state: RootState) => selectStatusData(state)?.error;

export const selectConsumerRegisteredQueues = (state: RootState) =>
    selectConsumerError(state) ? undefined : selectStatusData(state)?.registrations;

export const selectTargetQueue = (state: RootState) => {
    const registrations = selectConsumerRegisteredQueues(state);
    const target = state.navigation.tabs.consumer.filters.targetQueue;
    return (
        registrations?.find(({queue}) => queue === target?.queue) ??
        (registrations?.length === 1 ? registrations[0] : undefined)
    );
};

export const selectQueueAgentHost = (state: RootState) => selectStatusData(state)?.queue_agent_host;

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

export const selectConsumerPartitionsRequestKey = (state: RootState) =>
    JSON.stringify([
        selectCluster(state),
        selectPath(state),
        selectTransaction(state),
        selectConsumerName(state),
        selectTargetQueue(state)?.queue,
    ]);

const selectCurrentPartitions = (state: RootState) => {
    const partitions = state.navigation.tabs.consumer.partitions;
    return partitions.requestKey === selectConsumerPartitionsRequestKey(state)
        ? partitions
        : undefined;
};

const selectPartitionsData = (state: RootState) => selectCurrentPartitions(state)?.partitionsData;

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
    selectCurrentPartitions(state)?.partitionsError ?? null;

export const selectPartitionsLoading = (state: RootState) =>
    selectCurrentPartitions(state)?.partitionsLoading ?? false;

export const selectPartitionsLoaded = (state: RootState) =>
    selectCurrentPartitions(state)?.partitionsLoaded ?? false;
