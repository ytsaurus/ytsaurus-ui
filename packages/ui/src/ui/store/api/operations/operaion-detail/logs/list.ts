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
            const group: SelectOptionGroup<TLogsPanelSelectOptionData> = {
                label: logsLevel.group_info.name,
            };
            const options: (typeof group)['options'] = [];
            logsLevel.log_level_groups.forEach((logGroup) => {
                for (const l of logGroup.logs) {
                    options.push({
                        data: {logName: l.name, level: logGroup.log_level as ELogsPanelLevel},
                        value: l.name,
                        text: l.name,
                    });
                }
            });

            group.options = options;
            res.push(group);
        });

        return {data: res};
    } catch (error) {
        return {error};
    }
}
