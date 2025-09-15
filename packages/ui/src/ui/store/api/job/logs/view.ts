import axios from 'axios';
import {
    LogNamesFilter,
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
    names_filter: Array<LogNamesFilter>;
    substring_filter: LogSubstringFilter;
    time_range_filter: LogTimeRangeFilter;
    pagination_options: LogPaginationOptions;
};

type ViewJobLogsArgs = ViewJobLogsBodyArgs & ViewJobLogsQueryArgs;

type ViewJobLogsResponse = Array<LogRow>;

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
