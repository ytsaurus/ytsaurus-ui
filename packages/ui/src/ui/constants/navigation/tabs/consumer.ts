export const CONSUMER_STATUS_LOAD_REQUEST = 'CONSUMER_STATUS_LOAD_REQUEST';
export const CONSUMER_STATUS_LOAD_SUCCESS = 'CONSUMER_STATUS_LOAD_SUCCESS';
export const CONSUMER_STATUS_LOAD_FAILURE = 'CONSUMER_STATUS_LOAD_FAILURE';

export const CONSUMER_PARTITIONS_LOAD_REQUEST = 'CONSUMER_PARTITIONS_LOAD_REQUEST';
export const CONSUMER_PARTITIONS_LOAD_SUCCESS = 'CONSUMER_PARTITIONS_LOAD_SUCCESS';
export const CONSUMER_PARTITIONS_LOAD_FAILURE = 'CONSUMER_PARTITIONS_LOAD_FAILURE';

export const CONSUMER_CHANGE_FILTERS = 'CONSUMER_CHANGE_FILTERS';

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum CONSUMER_MODE {
    METRICS = 'metrics',
    PARTITIONS = 'partitions',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum CONSUMER_RATE_MODE {
    ROWS = 'rows',
    DATA_WEIGHT = 'data_weight',
}
