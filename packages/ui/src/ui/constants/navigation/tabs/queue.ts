export const QUEUE_STATUS_LOAD_REQUEST = 'QUEUE_STATUS_LOAD_REQUEST';
export const QUEUE_STATUS_LOAD_SUCCESS = 'QUEUE_STATUS_LOAD_SUCCESS';
export const QUEUE_STATUS_LOAD_FAILURE = 'QUEUE_STATUS_LOAD_FAILURE';

export const QUEUE_PARTITIONS_LOAD_REQUEST = 'QUEUE_PARTITIONS_LOAD_REQUEST';
export const QUEUE_PARTITIONS_LOAD_SUCCESS = 'QUEUE_PARTITIONS_LOAD_SUCCESS';
export const QUEUE_PARTITIONS_LOAD_FAILURE = 'QUEUE_PARTITIONS_LOAD_FAILURE';

export const QUEUE_CHANGE_PERSISTED_STATE = 'QUEUE_CHANGE_PERSISTED_STATE';

export const QUEUE_CHANGE_PARTITIONS_COLUMNS = 'QUEUE_CHANGE_PARTITIONS_COLUMNS';

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum QUEUE_MODE {
    METRICS = 'metrics',
    PARTITIONS = 'partitions',
    CONSUMERS = 'consumers',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum QUEUE_RATE_MODE {
    ROWS = 'rows',
    DATA_WEIGHT = 'data_weight',
}
