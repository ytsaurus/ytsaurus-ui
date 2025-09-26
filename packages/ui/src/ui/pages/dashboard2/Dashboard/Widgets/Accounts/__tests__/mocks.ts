import {HttpResponse, http} from 'msw';
import {DashboardAccountsResponse} from '../../../../../../store/api/dashboard2/accounts/accounts';
import {BatchResultsItem} from '../../../../../../../shared/yt-types';

export const accountsResponse: Array<BatchResultsItem<DashboardAccountsResponse>> = [
    {
        output: {
            $attributes: {
                committed_resource_usage: {
                    node_count: 3,
                    chunk_count: 3,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                resource_limits: {
                    node_count: 10,
                    chunk_count: 10,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        super_mega_wide_medium_that_cannot_fit_in: 171927192719281,
                    },
                    disk_space: 10485760,
                },
                allow_children_limit_overcommit: false,
                resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                total_children_resource_limits: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {},
                    disk_space: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
                name: 'mega-large-wide-big-name-it-cant-fit-in',
                recursive_resource_usage: {
                    node_count: 3,
                    chunk_count: 3,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        super_mega_wide_medium_that_cannot_fit_in: 17192719271928,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                recursive_committed_resource_usage: {
                    node_count: 2,
                    chunk_count: 2,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        super_mega_wide_medium_that_cannot_fit_in: 10192719271928,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                recursive_violated_resource_limits: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
            },
            $value: {},
        },
    },
    {
        output: {
            $attributes: {
                committed_resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                resource_limits: {
                    node_count: 10,
                    chunk_count: 10,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        super_mega_wide_medium_that_cannot_fit_in: 171927192719281,
                    },
                    disk_space: 10485760,
                },
                allow_children_limit_overcommit: false,
                resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                total_children_resource_limits: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {},
                    disk_space: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
                name: 'mega-large-wide-big-name-it-cant-fit-in',
                recursive_resource_usage: {
                    node_count: 10,
                    chunk_count: 10,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        super_mega_wide_medium_that_cannot_fit_in: 171927192719281,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                recursive_committed_resource_usage: {
                    node_count: 2,
                    chunk_count: 2,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        super_mega_wide_medium_that_cannot_fit_in: 101927192719281,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                recursive_violated_resource_limits: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
            },
            $value: {},
        },
    },
    {
        output: {
            $attributes: {
                committed_resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                resource_limits: {
                    node_count: 10,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 10485760,
                    },
                    disk_space: 10485760,
                    master_memory: {
                        total: 13312,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
                allow_children_limit_overcommit: false,
                resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                total_children_resource_limits: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {},
                    disk_space: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
                name: 'mega-large-wide-big-name-it-cant-fit-in',
                recursive_resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                recursive_committed_resource_usage: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    disk_space: 0,
                    chunk_host_cell_master_memory: 0,
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {
                            '2023': 0,
                            '3023': 0,
                            '4023': 0,
                            primary: 0,
                        },
                    },
                    detailed_master_memory: {
                        nodes: 0,
                        chunks: 0,
                        attributes: 0,
                        tablets: 0,
                        schemas: 0,
                    },
                },
                recursive_violated_resource_limits: {
                    node_count: 0,
                    chunk_count: 0,
                    tablet_count: 0,
                    tablet_static_memory: 0,
                    disk_space_per_medium: {
                        default: 0,
                    },
                    master_memory: {
                        total: 0,
                        chunk_host: 0,
                        per_cell: {},
                    },
                },
            },
            $value: {},
        },
    },
    {
        error: {
            code: 500,
            message: 'Account not found',
        },
    },
];

export const accountsHandler = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json(accountsResponse);
    },
);

export const accountsHandlerWithLoading = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    async ({request}) => {
        const body = await request.clone().json();
        if (body.requests[0].parameters.path !== '//sys/users/test-user/@usable_accounts') {
        }
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return Response.json(accountsResponse);
    },
);

export const accountsHandlerEmpty = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return Response.json([]);
    },
);

export const accountsHandlerError = http.post(
    'https://test-cluster.yt.my-domain.com/api/v3/execute_batch',
    () => {
        return HttpResponse.error();
    },
);
