import type {YTError} from '../../../../../types';

export interface TPerformanceCounters {
    '1m': number;
    '1h': number;
    '1d': number;
}

export interface YtQueueStatus {
    error?: YTError;
    partition_count: number;
    family: string;
    // alerts: list of TError;  // (unimplemented)
    write_data_weight_rate: TPerformanceCounters; // (unimplemented)
    read_data_weight_rate: TPerformanceCounters; // (unimplemented)
    write_row_count_rate: TPerformanceCounters; // (unimplemented)
    read_row_count_rate: TPerformanceCounters; // (unimplemented)
    registrations: Array<YtQueueConsumer>;
}

export interface YtQueueConsumer {
    vital: boolean; // DA
    consumer: string;
    error?: YTError; // may be missing
    read_data_weight_rate: TPerformanceCounters; // (unimplemented)
    read_row_count_rate: TPerformanceCounters; // (unimplemented)
}

// DataTableYT

export interface YtQueuePartition {
    error?: YTError;
    //! YSON map, specific to particular queue family.
    //! For ordered dynamic tables, {cell_id: TGuid, host: string}
    meta?: {cell_id: string; host: string}; // (unimplemented)
    lower_row_index: number;
    upper_row_index: number;
    //! Equals to upper_row_index - lower_row_index.
    available_row_count: number;
    last_row_commit_time: string | null; // May be null.
    commit_idle_time: number | null; // May be null.
    write_data_weight_rate: TPerformanceCounters; // (unimplemented)
    read_data_weight_rate: TPerformanceCounters; // (unimplemented)
    write_row_count_rate: TPerformanceCounters; // (unimplemented)
    read_row_count_rate: TPerformanceCounters; // (unimplemented)
}
