import {TLogsPanelEntry, TLogsPanelSelectOption} from '@yandex-data-ui/dynamic-logs-viewer';
import {operationDetailApi} from '..';
import {ListOperationLogsArgs, listOperationLogs} from './list';
import {LogsMeta, ViewOperationLogsArgs, viewOperationLogs} from './view';

export const operationLogsApi = operationDetailApi.injectEndpoints({
    endpoints: (build) => ({
        operationLogsView: build.query<TLogsPanelEntry<LogsMeta>[], ViewOperationLogsArgs>({
            queryFn: viewOperationLogs,
        }),
        operationLogsList: build.query<TLogsPanelSelectOption[], ListOperationLogsArgs>({
            queryFn: listOperationLogs,
        }),
    }),
});

export const {useOperationLogsListQuery, useOperationLogsViewQuery} = operationLogsApi;
