export type LogLevel = 'ERROR' | 'INFO' | 'DEBUG';

export type LogMeta = {
    log_level: LogLevel;
};

type LogEntry = {
    name: string;
    file_paths: Array<string>;
    log_level: LogLevel;
};

export type LogNamesFilter = {
    log_name: string;
    file_paths?: Array<string>;
};

export type GroupInfo = {
    name: string;
    jobs_filter: JobsFilter;
};

export type JobsFilter = {
    task_name: string;
    job_cookie: number;
};

export type LogRow = {
    log_name: string;
    file_path: string;
    raw_ts: number;
    formatted_ts: string;
    content: string;
    log_group?: string;
    log_level: LogLevel;
};

export type LogFilter = {
    log_name: string;
    file_paths: Array<string>;
    log_meta: LogMeta;
};

export type LogGroupFilter = {
    group_info: GroupInfo;
    logs_filter: Array<LogFilter>;
};

export type LogSubstringFilter = {
    substring: string;
    is_substring_case_sensetive?: boolean;
};

export type LogGroup = {
    group_info: GroupInfo;
    logs: Array<LogEntry>;
};

export type LogTimeRangeFilter = {
    ts_from?: string;
    ts_to?: string;
};

export type PaginationDirection = 'FORWARD' | 'BACKWARD';

export type LogPaginationOptions = {
    pagination_directions: PaginationDirection;
    pivot_ts?: number;
    page_size?: number;
};
