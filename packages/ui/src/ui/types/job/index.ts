import {Acl, YTError} from '../../types';

export interface RawJobEvent {
    time: string;
    state: string;
    phase?: string;
}

export interface RawJob {
    address: string;
    archive_state: string;
    finish_time?: string;
    start_time: string;
    hasCompetitors: boolean;
    has_spec: boolean;
    job_competition_id: string;
    operation_id: string;
    job_id: string;
    state: JobState;
    type: string;
    events: RawJobEvent[];
    exec_attributes: object;
    statistics: JobStatistics;
    monitoring_descriptor?: string;
    pool_tree?: string;
    is_stale?: boolean;
}

export type JobState =
    | 'aborted'
    | 'aborting'
    | 'completed'
    | 'completing'
    | 'failed'
    | 'failing'
    | 'initializing'
    | 'materializing'
    | 'pending'
    | 'preparing'
    | 'reviving'
    | 'running'
    | 'starting'
    | 'suspended'
    | 'running';

export interface CompetitiveJobs {
    archive_job_count: number;
    scheduler_job_count: number;
    controller_agent_job_count: number;
    errors: YTError[];
    jobs: RawJob[];
}

export type JobError = YTError | undefined;

export interface PreparedJob extends Partial<RawJob> {
    attributes: RawJob;
    id: string;
    isSupported: () => boolean;
    jobCompetitionId: string;
    operationId: string;
    startTime: string;
    finishTime?: string;
    duration: number;
    error?: JobError;

    prepareCommandURL: (command: string) => string;
}

export interface PreparedJobEvent {
    attributes: {
        [key: string]: number | string;
    };
    progress: {
        duration: number;
        precedingDuration: number;
    };
    duration: number;
    finishTime: string;
    state: string;
    time: string;
}

export type JobEvents = PreparedJobEvent[] | undefined;
export type JobStatistics = object | undefined;

export interface LeafStatistic {
    count: number;
    max: number;
    min: number;
    sum: number;
    last: number;
}

export interface StatisticsIO {
    table: string;
    busy_time: number;
    bytes: number;
    idle_time: number;
    isTotal?: boolean;
}

export interface PipesIO {
    busy_time: LeafStatistic;
    bytes: LeafStatistic;
    idle_time: LeafStatistic;
}

export interface JobPipes {
    input: PipesIO;
    output: Record<string, PipesIO>;
}

export interface JobStatistic {
    chunk_reader_statistics: {
        data_bytes_read_from_cache: LeafStatistic;
        data_bytes_read_from_disk: LeafStatistic;
        data_bytes_transmitted: LeafStatistic;
        meta_bytes_read_from_disk: LeafStatistic;
    };
    job_proxy: {
        aggregated_max_cpu_usage_x100: LeafStatistic;
        aggregated_preemptable_cpu_x100: LeafStatistic;
        aggregated_preempted_cpu_x100: LeafStatistic;
        aggregated_smoothed_cpu_usage_x100: LeafStatistic;
        block_io: {
            [key: string]: LeafStatistic;
        };
        cpu: {
            [key: string]: LeafStatistic;
        };
        max_memory: LeafStatistic;
        memory_reserve: LeafStatistic;
        preemptable_cpu_x100: LeafStatistic;
        smoothed_cpu_usage_x100: LeafStatistic;
        traffic: {
            outbound: {
                [key: string]: LeafStatistic;
            };
            [key: string]: LeafStatistic | object;
        };
    };
    user_job: {
        block_io: {
            [key: string]: LeafStatistic;
        };
        cpu: {
            [key: string]: LeafStatistic;
        };
        cumulative_memory_mb_sec: LeafStatistic;
        current_memory: {
            [key: string]: LeafStatistic;
        };
        max_memory: LeafStatistic;
        max_tmpfs_size: LeafStatistic;
        memory_limit: LeafStatistic;
        memory_reserve: LeafStatistic;
        memory_reserve_factor_x10000: LeafStatistic;
        pipes: JobPipes;
    };
    data: {
        [key: string]: {
            [key: string]: LeafStatistic;
        };
    };
}

export interface JobSpecification {
    abort_job_if_account_limit_exceeded: boolean;
    acl: Acl[];
    input_data_weight: number;
    input_row_count: number;
    extensions: object;
    input_table_specs: [];
    output_table_specs: [];
    io_config: object;
    job_competition_id: string;
    job_proxy_ref_counted_tracker_log_period: number;
    output_transaction_id: string;
    yt_alloc_large_unreclaimable_bytes: number;
    table_reader_options: object;
    user_job_spec: object;
    job_cpu_monitor_config: object;
}
