import axios from 'axios';
import {
    LogFilter,
    LogPaginationOptions,
    LogRow,
    LogSubstringFilter,
    LogTimeRangeFilter,
} from '../../../../types/operations/logs';

type ViewJobLogsQueryArgs = {
    operationId: string;
    jobId: string;
};

type ViewJobLogsBodyArgs = {
    cluster: string;
    logs_filter: Array<LogFilter>;
    substring_filter: LogSubstringFilter;
    time_range_filter: LogTimeRangeFilter;
    pagination_options: LogPaginationOptions;
};

export type ViewJobLogsArgs = ViewJobLogsBodyArgs & ViewJobLogsQueryArgs;

export type ViewJobLogsResponse = Array<LogRow>;

export function viewJobLogs(args: ViewJobLogsArgs) {
    try {
        const {operationId, jobId, cluster, ...rest} = args;
        const view = axios.post<ViewJobLogsResponse>(`api/logs/job/view/${operationId}/${jobId}`, {
            cluster,
            ...rest,
        });
        return {data: view};
    } catch (error) {
        return {error};
    }
}
