import {
    CONSUMER_CHANGE_FILTERS,
    CONSUMER_MODE,
    CONSUMER_RATE_MODE,
} from '../../../../../constants/navigation/tabs/consumer';
import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import type {ActionD} from '../../../../../types';
import {ConsumerQueueInfo} from './status';

export interface PartitionColumn<Names> {
    name: Names;
    checked: boolean;
    caption: string;
    keyColumn?: boolean;
    disabled?: boolean;
}

const CONSUMER_PARTITIONS_COLUMNS = [
    {id: 'partition_index', caption: '#'},
    {id: 'error', caption: 'Error'},
    {id: 'read_rate', caption: 'Read rate'},
    {id: 'next_row_index', caption: 'Next row idx'},
    {id: 'unread_row_count', caption: 'Unread rows'},
    {id: 'processing_lag', caption: 'Processing lag'},
    {id: 'next_row_commit_time', caption: 'Next row commit time'},
] as const;

export type ConsumerPartitionsColumns = (typeof CONSUMER_PARTITIONS_COLUMNS)[number]['id'];

export interface ConsumerFiltersState {
    consumerMode: CONSUMER_MODE;
    consumerPartitionIndex: string;
    consumerRateMode: CONSUMER_RATE_MODE;
    consumerTimeWindow: keyof TPerformanceCounters;
    partitionsColumns: Array<PartitionColumn<ConsumerPartitionsColumns>>;
    targetQueue: ConsumerQueueInfo | undefined;
}

export const initialState: ConsumerFiltersState = {
    consumerMode: CONSUMER_MODE.METRICS,
    consumerPartitionIndex: '',
    consumerRateMode: CONSUMER_RATE_MODE.ROWS,
    consumerTimeWindow: '1m',
    partitionsColumns: CONSUMER_PARTITIONS_COLUMNS.map(({id, caption}) => ({
        name: id,
        caption,
        checked: true,
    })),
    targetQueue: undefined,
};

function reducer(state = initialState, action: ConsumerFiltersAction): ConsumerFiltersState {
    switch (action.type) {
        case CONSUMER_CHANGE_FILTERS:
            return {...state, ...action.data};

        default: {
            return state;
        }
    }
}

export type ConsumerFiltersAction = ActionD<
    typeof CONSUMER_CHANGE_FILTERS,
    Partial<ConsumerFiltersState>
>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
