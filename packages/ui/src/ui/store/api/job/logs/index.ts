import {jobApi} from '..';
import {listJobLogs} from './list';
import {viewJobLogs} from './view';

export const jobLogsApi = jobApi.injectEndpoints({
    endpoints: (build) => ({
        jobLogsView: build.query({
            query: viewJobLogs,
        }),
        jobLogsList: build.query({
            query: listJobLogs,
        }),
    }),
});

export const {useJobLogsListQuery, useJobLogsViewQuery} = jobLogsApi;
