import {
    QUEUE_CHANGE_PARTITIONS_COLUMNS,
    QUEUE_CHANGE_PERSISTED_STATE,
    QUEUE_MODE,
    QUEUE_RATE_MODE,
} from '../../../../../constants/navigation/tabs/queue';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {type ActionD} from '../../../../../types';
import {type TPerformanceCounters} from './types';
import {type PartitionColumn} from '../consumer/filters';
import i18n from './i18n';

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

export type QueuePartitionsColumns =
    | 'partition_index'
    | 'error'
    | 'host'
    | 'cell_id'
    | 'write_rate'
    | 'lower_row_index'
    | 'upper_row_index'
    | 'available_row_count'
    | 'commit_idle_time'
    | 'last_row_commit_time';

const QUEUE_PARTITIONS_COLUMNS: Array<{id: QueuePartitionsColumns; caption: string}> = [
    {id: 'partition_index', caption: '#'},
    {
        id: 'error',
        get caption() {
            return i18n('field_error');
        },
    },
    {
        id: 'host',
        get caption() {
            return i18n('field_host');
        },
    },
    {
        id: 'cell_id',
        get caption() {
            return i18n('field_cell-id');
        },
    },
    {
        id: 'write_rate',
        get caption() {
            return i18n('field_write-rate');
        },
    },
    {
        id: 'lower_row_index',
        get caption() {
            return i18n('field_lower-row-idx');
        },
    },
    {
        id: 'upper_row_index',
        get caption() {
            return i18n('field_upper-row-idx');
        },
    },
    {
        id: 'available_row_count',
        get caption() {
            return i18n('field_available-rows');
        },
    },
    {
        id: 'commit_idle_time',
        get caption() {
            return i18n('field_commit-idle-time');
        },
    },
    {
        id: 'last_row_commit_time',
        get caption() {
            return i18n('field_last-row-commit-time');
        },
    },
];

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
