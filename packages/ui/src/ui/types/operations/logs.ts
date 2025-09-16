export type LogLevel = 'ERROR' | 'INFO' | 'DEBUG';

type LogEntry = {
    name: string;
    file_paths: Array<string>;
};

export type LogLevelGroup = {
    log_level: LogLevel;
    logs: Array<LogEntry>;
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

export type LogGroup = {
    group_info: GroupInfo;
    log_level_groups: Array<LogLevelGroup>;
};

export type LogGroupFilter = {
    group_info: GroupInfo;
    names_filter: Array<LogNamesFilter>;
};

export type LogSubstringFilter = {
    substring: string;
    is_substring_case_sensetive?: boolean;
};

export type LogTimeRangeFilter = {
    ts_from?: string;
    ts_to?: string;
};

export type PaginationDirection = 'FORWARD' | 'BACKWARD';

export type LogPaginationOptions = {
    pagination_directions: PaginationDirection;
    pivot_ts: number;
    page_size: number;
};

export type LogRow = {
    log_name: string;
    file_path: string;
    raw_ts: number;
    formatted_ts: string;
    content: string;
    log_group?: string;
};
