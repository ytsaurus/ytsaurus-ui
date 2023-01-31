import type {TPerformanceCounters} from '../../../../../store/reducers/navigation/tabs/queue/types';
import type {YTError} from '../../../../../types';

export interface YtConsumerStatus {
    error?: YTError; // may be missing
    // All attributes below are missing if error is not null.
    target_queue: string;
    vital: boolean;
    owner: string; // Always username.
    partition_count: number;
    read_data_weight_rate: TPerformanceCounters; // (unimplemented)
    read_row_count_rate: TPerformanceCounters; // (unimplemented)
}

export interface YtConsumerPartition {
    error?: YTError; // may be missing
    // All attributes below are missing if error is not null.
    //! YSON map with metainformation describing client. Key "host" is required.
    client_meta?: {client_host: string}; // (unimplemented)
    disposition: string; // pending_consumption/up_to_date/ahead/expired
    read_data_weight_rate: TPerformanceCounters; // (unimplemented)
    read_row_count_rate: TPerformanceCounters; // (unimplemented)
    next_row_index: number;
    unread_row_count: number;
    next_row_commit_time: string | null; // may be null
    processing_lag: number | null; // may be null
    last_consume_time: string;
    consume_idle_time: number;
}
