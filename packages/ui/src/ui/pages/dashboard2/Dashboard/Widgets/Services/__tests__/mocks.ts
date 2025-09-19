import {HttpResponse, http} from 'msw';
import {DashboardBundlesResponse} from '../../../../../../store/api/dashboard2/services/services';
import {BatchResultsItem} from '../../../../../../../shared/yt-types';

export const bundlesResponse: Array<BatchResultsItem<DashboardBundlesResponse>> = [
    {
        output: [
            {
                $attributes: {
                    tablet_cell_bundle: 'my-bundle',
                },
                $value: '11ff11-998f00-3fe02bc-2asd18',
            },
            {
                $attributes: {
                    tablet_cell_bundle: 'not-my-bundle',
                },
                $value: '11ff11-998f00-3fe02bc-2asd18',
            },
        ],
    },
    {
        output: {
            $attributes: {
                health: 'good',
                bundle_controller_target_config: {
                    tablet_node_count: 1,
                    tablet_node_resource_guarantee: {
                        memory: 21474836480,
                        vcpu: 4000,
                    },
                },
            },
            $value: null,
        },
    },
    {
        output: {
            $attributes: {
                enable_bundle_controller: true,
                health: 'failed',
                bundle_controller_target_config: {
                    tablet_node_count: 1,
                    tablet_node_resource_guarantee: {
                        memory: 107374182400,
                        vcpu: 28000,
                    },
                },
            },
            $value: null,
        },
    },
    {
        error: {
            code: 500,
            message: 'Something happend',
        },
    },
];
export const chytResponse = {
    result: [
        {
            $value: 'my-super-mega-wide-big-large-clique-that-cant-fit-in',
            $attributes: {
                creation_time: '2023-12-26T14:50:21.652708Z',
                creator: 'robot-my-robot',
                health: 'pending',
                health_reason: 'info state contains error',
                instance_count: 2,
                state: 'active',
                total_cpu: 32,
                total_memory: 139586437120,
                yt_operation_id: '720c21db-a36e5525-3fe03e8-3e65f1d4',
            },
        },
    ],
};

export const servicesHandler = [
    http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
        return Response.json(bundlesResponse);
    }),
    http.post('/api/strawberry/chyt/test-cluster/list', () => {
        return Response.json(chytResponse);
    }),
];

export const servicesHandlerWithLoading = [
    http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(bundlesResponse);
    }),
    http.post('/api/strawberry/chyt/test-cluster/list', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(chytResponse);
    }),
];

export const servicesHandlerEmpty = [
    http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
        return Response.json([]);
    }),
    http.post('/api/strawberry/chyt/test-cluster/list', () => {
        return Response.json({result: []});
    }),
];

export const servicesHandlerError = [
    http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
        return HttpResponse.error();
    }),
    http.post('/api/strawberry/chyt/test-cluster/list', () => {
        return HttpResponse.error();
    }),
];
