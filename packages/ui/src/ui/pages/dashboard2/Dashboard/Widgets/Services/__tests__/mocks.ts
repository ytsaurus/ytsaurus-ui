import {HttpResponse, http} from 'msw';

export const bundlesResponse = [
    {
        output: true,
    },
    {
        output: {
            $attributes: {
                health: 'good',
                bundle_controller_target_config: {
                    cpu_limits: {
                        lookup_thread_pool_size: 4,
                        query_thread_pool_size: 4,
                        write_thread_pool_size: 4,
                    },
                    memory_limits: {
                        compressed_block_cache: 1073741824,
                        lookup_row_cache: 1073741824,
                        reserved: 24696061952,
                        tablet_dynamic: 2147483648,
                        tablet_static: 4294967296,
                        uncompressed_block_cache: 1073741824,
                        versioned_chunk_meta: 2147483648,
                    },
                    rpc_proxy_count: 0,
                    rpc_proxy_resource_guarantee: {
                        memory: 21474836480,
                        net: 2684354560,
                        net_bytes: 335544320,
                        type: 'medium',
                        vcpu: 10000,
                    },
                    tablet_node_count: 1,
                    tablet_node_resource_guarantee: {
                        memory: 107374182400,
                        net: 5368709120,
                        net_bytes: 671088640,
                        type: 'cpu_intensive',
                        vcpu: 28000,
                    },
                },
            },
            $value: null,
        },
    },
    {
        output: {
            $attributes: {
                health: 'good',
                bundle_controller_target_config: {
                    cpu_limits: {
                        lookup_thread_pool_size: 1,
                        query_thread_pool_size: 1,
                        write_thread_pool_size: 1,
                    },
                    memory_limits: {
                        compressed_block_cache: 1073741824,
                        lookup_row_cache: 1073741824,
                        reserved: 8589934592,
                        tablet_dynamic: 2147483648,
                        tablet_static: 4294967296,
                        uncompressed_block_cache: 1073741824,
                        versioned_chunk_meta: 2147483648,
                    },
                    rpc_proxy_count: 0,
                    rpc_proxy_resource_guarantee: {
                        memory: 21474836480,
                        net: 2684354560,
                        net_bytes: 335544320,
                        type: 'medium',
                        vcpu: 10000,
                    },
                    tablet_node_count: 1,
                    tablet_node_resource_guarantee: {
                        memory: 21474836480,
                        net: 1342177280,
                        net_bytes: 167772160,
                        type: 'tiny',
                        vcpu: 4000,
                    },
                },
            },
            $value: null,
        },
    },
];
export const chytResponse = {
    result: [
        {
            $value: 'my-clique',
            $attributes: {
                creation_time: '2023-12-26T14:50:21.652708Z',
                creator: 'robot-my-robot',
                health: 'failed',
                health_reason: 'info state contains error',
                instance_count: 2,
                state: 'active',
                total_cpu: 32,
                total_memory: 139586437120,
                yt_operation_id: '720c21db-a36e5525-3fe03e8-3e65f1d4',
            },
        },
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
