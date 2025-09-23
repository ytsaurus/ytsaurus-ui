import axios from 'axios';
import {ELogsPanelLevel, TLogsPanelSelectOption} from '@yandex-data-ui/dynamic-logs-viewer';
import {type LogEntry} from '../../../../types/operations/logs';


type ListJobLogsQueryArgs = {
    operationId: string;
    jobId: string;
};

type ListJobLogsBodyArgs = {
    cluster: string;
};

export type ListJobLogsArgs = ListJobLogsBodyArgs & ListJobLogsQueryArgs;

export type ListJobLogsResponse = Array<LogEntry>;

export type ListJobLogsResult = {
    raw: ListJobLogsResponse;
    options: TLogsPanelSelectOption[];
};

export async function listJobLogs(args: ListJobLogsArgs) {
    try {
        const {operationId, jobId, cluster} = args;
        const {data} = await axios.post<ListJobLogsResponse>(`api/logs/job/list/${operationId}/${jobId}`, {
            cluster,
        });

        if (!data) {
            return {data: {options: [], raw: []}};
        }

        const res: TLogsPanelSelectOption[] = [];

        data.forEach((log) => {
            res.push({
                data: {logName: log.name, level: log.log_level as ELogsPanelLevel},
                value: log.name,
                text: log.name,
            });
        });

        return {data: {options: res, raw: data}};
    } catch (error) {
        return {error};
    }
}
