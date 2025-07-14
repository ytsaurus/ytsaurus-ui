import {HttpResponse, http} from 'msw';

const pathsResponse = [
    {
        output: {
            type: 'map_node',
            path: '//home',
        },
    },
    {
        output: {
            type: 'map_node',
            path: '/',
        },
    },
    {
        output: {
            sorted: false,
            dynamic: true,
            type: 'table',
            path: '//home/queue',
        },
    },
    {
        output: {
            sorted: true,
            treat_as_queue_producer: true,
            dynamic: true,
            type: 'table',
            path: '//home/producer',
            treat_as_queue_consumer: false,
        },
    },
    {
        output: {
            sorted: true,
            treat_as_queue_producer: false,
            dynamic: true,
            type: 'table',
            path: '//home/consumer',
            treat_as_queue_consumer: true,
        },
    },
    {
        error: {
            code: 901,
            message:
                'Access denied for user "autushka": "read" permission for node //home/some-node is not allowed by any matching ACE',
            attributes: {
                datetime: '2025-07-18T10:18:03.033991Z',
                permission: ['read'],
                user: 'autushka',
            },
        },
    },
    {
        output: {
            sorted: true,
            treat_as_queue_producer: false,
            dynamic: true,
            type: 'table',
            path: '//home/dynamic/sorted',
            treat_as_queue_consumer: false,
        },
    },
    {
        output: {
            type: 'table',
            path: '//home/static',
        },
    },
    {
        output: {
            path: '//tmp/trash',
        },
    },
    {
        output: {
            type: 'map_node',
            path: '//home/yet/another/map_node',
        },
    },
    {
        output: {
            sorted: false,
            dynamic: false,
            type: 'table',
            path: '//tmp/not/a/simple/super/wide/super/long/mega/really',
        },
    },
    {
        output: {
            type: 'map_node',
            path: '//home/id/1239172312983719-1111-123231202123/temp/tests/wide/megawide',
        },
    },
    {
        output: {
            type: 'map_node',
            path: '//',
        },
    },
    {
        output: {
            type: 'map_node',
            path: '//home/super-extra-mega-large-wide-not-a-short/111-1111-111-111',
        },
    },
    {
        output: {
            type: 'map_node',
            path: '//home/superhome',
        },
    },
];

export const pathsHandler = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json(pathsResponse);
    },
);

export const pathsHandlerWithLoading = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(pathsResponse);
    },
);

export const pathsHandlerEmpty = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json([]);
    },
);

export const pathsHandlerError = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return HttpResponse.error();
    },
);
