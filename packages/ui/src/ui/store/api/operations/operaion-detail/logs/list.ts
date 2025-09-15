import axios from 'axios';
import {ELogsPanelLevel, TLogsPanelSelectOption} from '@yandex-data-ui/dynamic-logs-viewer';
import {LogLevelGroup} from '../../../../../types/operations/logs';

type ListOperationLogsQueryArgs = {
    operationId: string;
};

type ListOperationLogsBodyArgs = {
    cluster: string;
};

export type ListOperationLogsArgs = ListOperationLogsBodyArgs & ListOperationLogsQueryArgs;

export type ListOperationLogsResponse = Array<LogLevelGroup>;

export async function listOperationLogs(args: ListOperationLogsArgs) {
    try {
        const {operationId, cluster} = args;
        const {data} = await axios.post<ListOperationLogsResponse>(
            `/api/logs/operation/list/${operationId}`,
            {
                cluster,
            },
        );

        if (!data) {
            return {data: []};
        }

        const res: TLogsPanelSelectOption[] = [];

        data.forEach((logsLevel) => {
            logsLevel.logs.forEach((log) => {
                res.push({
                    value: log.name,
                    content: log.name,
                    data: {logName: log.name, level: logsLevel.log_level as ELogsPanelLevel},
                });
            });
        });

        return {data: res};
    } catch (error) {
        return {error};
    }
}
