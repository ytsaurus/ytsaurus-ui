import {http} from 'msw';
import {BatchResultsItem} from '../../../../../../../shared/yt-types';
import {DashboardPoolsResponse} from '../../../../../../store/api/dashboard2/pools/pools';

export const poolsResponse: Array<BatchResultsItem<DashboardPoolsResponse>> = [
    {
        output: {
            running_operation_count: 35,
            max_operation_count: 71,
            resource_usage: {
                cpu: 80,
                gpu: 0,
                user_memory: 4528466560183,
            },
            estimated_guarantee_resources: {
                cpu: 134,
                gpu: 0,
                user_memory: 6528466560183,
            },
        },
    },
    {
        output: {
            running_operation_count: 100,
            max_operation_count: 71,
            resource_usage: {
                cpu: 150,
                gpu: 0,
                user_memory: 7528466560183,
            },
            estimated_guarantee_resources: {
                cpu: 134,
                gpu: 0,
                user_memory: 6528466560183,
            },
        },
    },
    {
        output: {
            running_operation_count: 0,
            max_operation_count: 0,
            resource_usage: {
                cpu: 0,
                gpu: 0,
                user_memory: 0,
            },
            estimated_guarantee_resources: {
                cpu: 0,
                gpu: 0,
                user_memory: 0,
            },
        },
    },
    {
        error: {
            code: 500,
            message: 'Pool not found',
        },
    },
];

export const poolsHandler = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json(poolsResponse);
    },
);

export const poolsHandlerWithLoading = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(poolsResponse);
    },
);

export const poolsHandlerEmpty = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json([]);
    },
);

export const poolsHandlerError = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return new Response('Internal Server Error', {status: 500});
    },
);
