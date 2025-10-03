import {HttpResponse, http} from 'msw';
import {QueriesListResponse} from '../../../../../../types/query-tracker/api';
import {BatchResultsItem} from '../../../../../../../shared/yt-types';
import {QueryEngine} from '../../../../../../../shared/constants/engines';
import {QueryStatus} from '../../../../../../types/query-tracker';

export const queriesResponse: {results: Array<BatchResultsItem<QueriesListResponse>>} = {
    results: [
        {
            output: {
                queries: [
                    {
                        id: 'cf0afa8a-2b77cf2b-47a0a07b-339419b4',
                        engine: QueryEngine.SPYT,
                        query: 'SELECT * FROM home_table',
                        supportedEngines: {spyt: true, yql: true, ql: true, chyt: true},
                        files: [],
                        secrets: [],
                        start_time: '2025-06-10T07:28:13.371172Z',
                        finish_time: '2025-06-10T07:28:18.347557Z',
                        settings: {
                            cluster: 'test-cluster',
                        },
                        user: 'test-user',
                        access_control_object: 'nobody',
                        access_control_objects: ['nobody'],
                        state: QueryStatus.DRAFT,
                        result_count: 13,
                        progress: {},
                        annotations: {
                            title: 'SUPER EXTRA LONG WIDE BIG LARGE TITLE',
                        },
                    },
                    {
                        id: 'a0c86a32-4c254502-6aa4b458-98f2579f',
                        engine: QueryEngine.CHYT,
                        supportedEngines: {spyt: true, yql: true, ql: true, chyt: true},
                        query: 'SELECT * FROM home_table',
                        files: [],
                        secrets: [],
                        start_time: '2025-06-10T07:27:23.857268Z',
                        finish_time: '2025-06-10T07:27:32.222630Z',
                        settings: {
                            cluster: 'test-cluster',
                        },
                        user: 'user-with-super-long-nickname-lets-test-it',
                        access_control_object: 'nobody',
                        access_control_objects: ['nobody'],
                        state: QueryStatus.COMPLETED,
                        result_count: 9,
                        annotations: {
                            title: 'SUPER EXTRA LONG WIDE BIG LARGE TITLE',
                        },
                    },
                    {
                        id: 'e52ba674-c9f95392-8cf68be4-31aea2a1',
                        engine: QueryEngine.YQL,
                        query: 'SELECT * FROM home_table',
                        files: [],
                        secrets: [],
                        supportedEngines: {spyt: true, yql: true, ql: true, chyt: true},
                        start_time: '2025-06-10T07:26:17.848980Z',
                        finish_time: '2025-06-10T07:26:18.798600Z',
                        settings: {
                            cluster: 'test-cluster',
                        },
                        user: 'test-user',
                        access_control_object: 'nobody',
                        access_control_objects: ['nobody'],
                        state: QueryStatus.FAILED,
                        result_count: 0,
                        annotations: {
                            title: 'SUPER EXTRA LONG WIDE BIG LARGE TITLE',
                        },
                    },
                ],
                incomplete: true,
                timestamp: 1880524495742530000,
            },
        },
    ],
};

export const queriesHandler = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/execute_batch',
    () => {
        return Response.json(queriesResponse);
    },
);

export const queriesHandlerWithLoading = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/execute_batch',
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(queriesResponse);
    },
);

export const queriesHandlerEmpty = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/execute_batch',
    () => {
        return Response.json([]);
    },
);

export const queriesHandlerError = http.post(
    'https://test-cluster.yt.my-domain.com/api/v4/execute_batch',
    () => {
        return HttpResponse.error();
    },
);
