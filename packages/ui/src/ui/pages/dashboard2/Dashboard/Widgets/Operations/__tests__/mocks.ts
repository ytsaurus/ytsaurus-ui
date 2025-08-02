import {HttpResponse, http} from 'msw';
import {BatchResultsItem} from '../../../../../../../shared/yt-types';
import {DashboardOperationsResponse} from '../../../../../../store/api/dashboard2/operations/operations';

export const batchResponse: Array<BatchResultsItem<DashboardOperationsResponse>> = [
    {
        output: {
            operations: [
                {
                    id: '29fc0401-d6cf3f96-3ff03e8-d4b290f3',
                    state: 'initializing',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'robot-chyt',
                    start_time: '2025-04-29T13:22:18.889403Z',
                    brief_progress: {
                        state: 'running' as const,
                        jobs: {
                            total: 20,
                            running: 20,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 20,
                            running: 20,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:51.751351Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-400000d9-bcf0001-4e74',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'CHYT clique 1',
                        alias: '1',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'chyt',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
                {
                    id: 'c52db46c-d668ccf7-3ff03e8-acad62df',
                    state: 'pending',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'robot-chyt',
                    start_time: '2025-04-29T13:11:44.225066Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 2,
                            running: 2,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 2,
                            running: 2,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:48.416752Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-400000d8-bcf0001-cf47',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'CHYT clique 3',
                        alias: '3',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'chyt',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
                {
                    id: '8a6f0f0b-b4dacd01-3ff03e8-54f79504',
                    state: 'running',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'robot-chyt',
                    start_time: '2025-04-29T13:06:57.424376Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:51.750565Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-400000da-bcf0001-cda1',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'CHYT clique 4',
                        alias: '4',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'chyt',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
                {
                    id: '89d2b056-ec70b884-3ff03e8-84ccfb91',
                    state: 'aborted',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'robot-chyt',
                    start_time: '2025-04-29T13:06:56.853981Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:50.216449Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-513-bcf0001-d2a6',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'SPYT Livy',
                        alias: '5',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'chyt',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
                {
                    id: 'some_id_5',
                    state: 'failed',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'robot-chyt',
                    start_time: '2025-04-29T13:06:56.853981Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:50.216449Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-513-bcf0001-d2a6',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'SPYT Livy Server *spyt_public',
                        alias: '*spyt_public',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'chyt',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
                {
                    id: 'some_id_6',
                    state: 'completed',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'robot-chyt',
                    start_time: '2025-04-29T13:06:56.853981Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:50.216449Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-513-bcf0001-d2a6',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'SPYT Livy Server 6',
                        alias: '6',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'chyt',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
            ],
        },
    },
];

export const batchResponseLong = [
    {
        output: {
            operations: [
                {
                    id: '29fc0401-d6cf3f96-3ff03e8-d4b290f3',
                    state: 'initializing',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'super-puper-mega-robot-ultra-long',
                    start_time: '2025-04-29T13:22:18.889403Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 20,
                            running: 20,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 20,
                            running: 20,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:51.751351Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-400000d9-bcf0001-4e74',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'Ultra wide mega large ultra mega super !!!!!',
                        alias: '1',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'mega-pool-ultra-wide-extra-large',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
                {
                    id: '8a6f0f0b-b4dacd01-3ff03e8-54f79504',
                    state: 'running',
                    type: 'vanilla',
                    operation_type: 'vanilla',
                    authenticated_user: 'super-puper-mega-robot-ultra-long',
                    start_time: '2025-04-29T13:06:57.424376Z',
                    brief_progress: {
                        state: 'running',
                        jobs: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        total_job_counter: {
                            total: 1,
                            running: 1,
                            completed: 0,
                            failed: 0,
                            pending: 0,
                            suspended: 0,
                            aborted: 0,
                            lost: 0,
                            invalidated: 0,
                            blocked: 0,
                        },
                        build_time: '2025-06-29T15:19:51.750565Z',
                        registered_monitoring_descriptor_count: 0,
                        input_transaction_id: '5a17b725-400000da-bcf0001-cda1',
                        output_transaction_id: '0-0-0-0',
                    },
                    brief_spec: {
                        title: 'Super wide mega large title with id: 1111-1111-1111',
                        alias: '4',
                        user_transaction_id: '0-0-0-0',
                        input_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                        output_table_paths: {
                            $attributes: {
                                count: 0,
                            },
                            $value: [],
                        },
                    },
                    runtime_parameters: {
                        controller_agent_tag: 'default',
                        erased_trees: [],
                        options_per_job_shell: {},
                        owners: [],
                        scheduling_options_per_pool_tree: {
                            physical: {
                                enable_detailed_logs: false,
                                offloading: false,
                                pool: 'super-mega-pool-with-id-1111-1111-1111-1111',
                                probing: false,
                                resource_limits: {},
                                tentative: false,
                            },
                        },
                        scheduling_tag_filter: '',
                    },
                    suspended: false,
                },
            ],
        },
    },
];

export const operationsHandler = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json(batchResponse);
    },
);

export const operationsHandlerWithLoading = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    async () => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(batchResponse);
    },
);

export const operationsHandlerEmpty = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json([{output: {operations: []}}]);
    },
);

export const operationsHandlerError = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return HttpResponse.error();
    },
);

export const operationsHandlerLongNames = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json(batchResponseLong);
    },
);
