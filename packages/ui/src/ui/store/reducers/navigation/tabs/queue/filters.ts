import {
    QUEUE_CHANGE_PERSISTED_STATE,
    QUEUE_CHANGE_PARTITIONS_COLUMNS,
    QUEUE_MODE,
    QUEUE_RATE_MODE,
} from '../../../../../constants/navigation/tabs/queue';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD} from '../../../../../types';
import type {TPerformanceCounters} from './types';
import {PartitionColumn} from '../consumer/filters';

export interface QueueFiltersState {
    queueMode: QUEUE_MODE;
    queuePartitionIndex: string;
    queueTabletCellHost: string;
    queueTabletCellId: string;
    queueConsumerName: string;
    queueOwner: string;
    queueRateMode: QUEUE_RATE_MODE;
    queueTimeWindow: keyof TPerformanceCounters;
    partitionsColumns: Array<PartitionColumn<QueuePartitionsColumns>>;
}

export type QueuePartitionsColumns = typeof QUEUE_PARTITIONS_COLUMNS[number]['id'];

const QUEUE_PARTITIONS_COLUMNS = [
    {id: 'partition_index', caption: '#'},
    {id: 'error', caption: 'Error'},
    {id: 'host', caption: 'Tablet cell host'},
    {id: 'cell_id', caption: 'Tablet cell ID'},
    {id: 'write_rate', caption: 'Write rate'},
    {id: 'lower_row_index', caption: 'Lower row idx'},
    {id: 'upper_row_index', caption: 'Upper row idx'},
    {id: 'available_row_count', caption: 'Available rows'},
    {id: 'commit_idle_time', caption: 'Commit idle time, ms'},
    {id: 'last_row_commit_time', caption: 'Last row commit time'},
] as const;

export const initialState: QueueFiltersState = {
    queueMode: QUEUE_MODE.METRICS,
    queuePartitionIndex: '',
    queueTabletCellHost: '',
    queueTabletCellId: '',
    queueConsumerName: '',
    queueOwner: '',
    queueRateMode: QUEUE_RATE_MODE.ROWS,
    queueTimeWindow: '1m',
    partitionsColumns: QUEUE_PARTITIONS_COLUMNS.map(({id, caption}) => ({
        name: id,
        caption,
        checked: true,
    })),
};

function reducer(state = initialState, action: QueueFiltersAction): QueueFiltersState {
    switch (action.type) {
        case QUEUE_CHANGE_PERSISTED_STATE:
            return {...state, ...action.data};

        case QUEUE_CHANGE_PARTITIONS_COLUMNS:
            return {...state, ...action.data};

        default: {
            return state;
        }
    }
}

export type QueueFiltersAction = ActionD<
    typeof QUEUE_CHANGE_PERSISTED_STATE | typeof QUEUE_CHANGE_PARTITIONS_COLUMNS,
    Partial<QueueFiltersState>
>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
