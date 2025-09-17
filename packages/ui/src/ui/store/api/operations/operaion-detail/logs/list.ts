import axios from 'axios';
import {
    ELogsPanelLevel,
    TLogsPanelSelectOption,
    TLogsPanelSelectOptionData,
} from '@yandex-data-ui/dynamic-logs-viewer';
import {LogGroup} from '../../../../../types/operations/logs';
import {SelectOptionGroup} from '@gravity-ui/uikit';

type ListOperationLogsQueryArgs = {
    operationId: string;
};

type ListOperationLogsBodyArgs = {
    cluster: string;
};

export type ListOperationLogsArgs = ListOperationLogsBodyArgs & ListOperationLogsQueryArgs;

export type ListOperationLogsResponse = Array<LogGroup>;

export type ListOperationLogsResult = {
    raw: ListOperationLogsResponse;
    options: TLogsPanelSelectOption[];
};

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
            return {data: {options: [], raw: []}};
        }

        const res: TLogsPanelSelectOption[] = [];

        data.forEach((logsGroup) => {
            const group: SelectOptionGroup<TLogsPanelSelectOptionData> = {
                label: logsGroup.group_info.name,
            };
            const options: (typeof group)['options'] = [];
            logsGroup.logs.forEach((log) => {
                options.push({
                    data: {logName: log.name, level: log.log_level as ELogsPanelLevel},
                    value: log.name,
                    text: log.name,
                });
            });

            group.options = options;
            res.push(group);
        });

        return {data: {options: res, raw: data}};
    } catch (error) {
        return {error};
    }
}
