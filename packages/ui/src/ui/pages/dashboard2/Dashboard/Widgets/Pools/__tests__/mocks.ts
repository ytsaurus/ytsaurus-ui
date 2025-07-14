import {http} from 'msw';

export const poolsResponse = [
    {
        output: {
            full_path: 'notroot',
            running_operation_count: 35,
            max_running_operation_count: 26,
            max_operation_count: 71,
            dominant_resource: 'cpu',
            resource_usage: {
                user_slots: 0,
                cpu: 80,
                gpu: 0,
                user_memory: 4528466560183,
                network: 0,
            },
            estimated_guarantee_resources: {
                user_slots: 670,
                cpu: 134,
                gpu: 0,
                user_memory: 6528466560183,
                network: 670,
            },
        },
    },
    {
        output: {
            full_path: 'root',
            running_operation_count: 100,
            max_running_operation_count: 26,
            max_operation_count: 71,
            dominant_resource: 'cpu',
            resource_usage: {
                user_slots: 0,
                cpu: 150,
                gpu: 0,
                user_memory: 7528466560183,
                network: 0,
            },
            estimated_guarantee_resources: {
                user_slots: 670,
                cpu: 134,
                gpu: 0,
                user_memory: 6528466560183,
                network: 670,
            },
        },
    },
    {
        output: {
            full_path: 'supermegawideextralargenameofpoolthatcantfitin',
            running_operation_count: 0,
            max_running_operation_count: 0,
            max_operation_count: 0,
            dominant_resource: 'cpu',
            resource_usage: {
                user_slots: 0,
                cpu: 0,
                gpu: 0,
                user_memory: 0,
                network: 0,
            },
            estimated_guarantee_resources: {
                user_slots: 0,
                cpu: 0,
                gpu: 0,
                user_memory: 0,
                network: 670,
            },
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
