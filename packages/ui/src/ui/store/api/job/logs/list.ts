import axios from 'axios';
import {LogLevelGroup} from '../../../../types/operations/logs';

type ListJobLogsQueryArgs = {
    operationId: string;
    jobId: string;
};

type ListJobLogsBodyArgs = {
    cluster: string;
};

type ListJobLogsArgs = ListJobLogsBodyArgs & ListJobLogsQueryArgs;

type ListJobLogsResponse = Array<LogLevelGroup>;

export function listJobLogs(args: ListJobLogsArgs) {
    try {
        const {operationId, jobId, cluster} = args;
        const list = axios.post<ListJobLogsResponse>(`api/logs/job/list/${operationId}/${jobId}`, {
            cluster,
        });
        return {data: list};
    } catch (error) {
        return {error};
    }
}
