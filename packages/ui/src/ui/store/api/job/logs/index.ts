import { TLogsPanelEntry } from '@yandex-data-ui/dynamic-logs-viewer';
import {LogMeta} from '../../../../types/operations/logs';
import {jobApi} from '..';
import {listJobLogs, ListJobLogsArgs, ListJobLogsResult} from './list';
import {viewJobLogs, ViewJobLogsArgs} from './view';

export const jobLogsApi = jobApi.injectEndpoints({
    endpoints: (build) => ({
        jobLogsView: build.query<TLogsPanelEntry<LogMeta>[], ViewJobLogsArgs>({
            query: viewJobLogs,
        }),
        jobLogsList: build.query<ListJobLogsResult, ListJobLogsArgs>({
            query: listJobLogs,
        }),
    }),
});

export const {useJobLogsListQuery, useJobLogsViewQuery} = jobLogsApi;
