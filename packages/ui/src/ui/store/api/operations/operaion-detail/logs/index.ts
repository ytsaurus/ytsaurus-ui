import {TLogsPanelEntry} from '@yandex-data-ui/dynamic-logs-viewer';
import {operationDetailApi} from '..';
import {ListOperationLogsArgs, ListOperationLogsResult, listOperationLogs} from './list';
import {ViewOperationLogsArgs, viewOperationLogs} from './view';
import {LogMeta} from '../../../../../types/operations/logs';

export const operationLogsApi = operationDetailApi.injectEndpoints({
    endpoints: (build) => ({
        operationLogsView: build.query<TLogsPanelEntry<LogMeta>[], ViewOperationLogsArgs>({
            queryFn: viewOperationLogs,
        }),
        operationLogsList: build.query<ListOperationLogsResult, ListOperationLogsArgs>({
            queryFn: listOperationLogs,
        }),
    }),
});

export const {useOperationLogsListQuery, useOperationLogsViewQuery} = operationLogsApi;
