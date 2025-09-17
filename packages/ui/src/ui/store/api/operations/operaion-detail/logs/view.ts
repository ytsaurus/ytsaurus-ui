import axios from 'axios';
import {TLogsPanelEntry} from '@yandex-data-ui/dynamic-logs-viewer/build/esm';
import {
    LogGroupFilter,
    LogMeta,
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
    log_group_filters: Array<LogGroupFilter>;
    substring_filter?: LogSubstringFilter;
    time_range_filter?: LogTimeRangeFilter;
    pagination_options?: LogPaginationOptions;
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

        const res: TLogsPanelEntry<LogMeta>[] = [];

        view.forEach((logRow) => {
            res.push({
                content: logRow.content,
                id: logRow.log_name,
                displayTimestamp: logRow.formatted_ts,
                timestamp: String(logRow.raw_ts),
                meta: {log_level: logRow.log_level},
            });
        });

        return {data: res};
    } catch (error) {
        return {error};
    }
}
