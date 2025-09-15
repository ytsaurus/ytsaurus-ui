import axios from 'axios';
import {TLogsPanelEntry} from '@yandex-data-ui/dynamic-logs-viewer/build/esm';
import {
    LogLevel,
    LogNamesFilter,
    LogPaginationOptions,
    LogRow,
    LogSubstringFilter,
    LogTimeRangeFilter,
} from '../../../../../types/operations/logs';

type ViewOperationLogsQueryArgs = {
    operationId: string;
};

type ViewOperationLogsBodyArgs = {
    cluster: string;
    names_filter: Array<LogNamesFilter>;
    substring_filter?: LogSubstringFilter;
    time_range_filter?: LogTimeRangeFilter;
    pagination_options?: LogPaginationOptions;
};

export type LogsMeta = {
    level: LogLevel;
};

export type ViewOperationLogsArgs = ViewOperationLogsBodyArgs & ViewOperationLogsQueryArgs;

export type ViewOperationLogsResponse = Array<LogRow>;

export async function viewOperationLogs(args: ViewOperationLogsArgs) {
    try {
        const {operationId, cluster, ...rest} = args;
        const resp = await axios.post<ViewOperationLogsResponse>(
            `/api/logs/operation/view/${operationId}`,
            {
                cluster,
                ...rest,
            },
        );
        const view = resp.data;

        if (!view) {
            return {data: []};
        }

        const res: TLogsPanelEntry<LogsMeta>[] = [];

        view.forEach((logRow) => {
            res.push({
                content: logRow.content,
                id: logRow.log_name,
                displayTimestamp: logRow.formatted_ts,
                timestamp: String(logRow.raw_ts),
                meta: {level: 'ERROR'},
            });
        });

        return {data: res};
    } catch (error) {
        return {error};
    }
}
