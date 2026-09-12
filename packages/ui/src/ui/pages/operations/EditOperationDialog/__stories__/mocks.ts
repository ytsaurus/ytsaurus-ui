import {http} from 'msw';

import {type OperationEditAttributes} from '../../../../utils/operations/edit-operation';

export const TEST_CLUSTER = 'test-cluster.yt.my-domain.com';
export const TEST_OPERATION_ID = '33ab3f-bf1df917-b35fe9ed-c70a4bf4';

const getOperationUrl = /\/api\/v3\/get_operation$/;

export const operation: OperationEditAttributes = {
    id: TEST_OPERATION_ID,
    state: 'running',
    full_spec: {
        max_failed_job_count: 3,
        tasks: {
            mapper: {job_count: 20},
            reducer: {job_count: 5},
        },
    },
    cumulative_spec_patch: {
        max_failed_job_count: 10,
        tasks: {
            mapper: {job_count: 25},
        },
    },
    runtime_parameters: {
        scheduling_options_per_pool_tree: {
            cloud: {
                pool: 'ma-efremoff',
                weight: 2,
                resource_limits: {
                    cpu: 4,
                    gpu: 1,
                    memory: 8 * 1024 * 1024 * 1024,
                    user_slots: 3,
                },
            },
            physical: {
                pool: 'ma-efremoff',
                weight: 1,
                resource_limits: {
                    cpu: 2,
                    memory: 4 * 1024 * 1024 * 1024,
                    user_slots: 2,
                },
            },
        },
    },
};

export const terminalOperation: OperationEditAttributes = {
    ...operation,
    state: 'completed',
};

export const longPoolTreeOperation: OperationEditAttributes = {
    ...operation,
    runtime_parameters: {
        scheduling_options_per_pool_tree: {
            ...operation.runtime_parameters?.scheduling_options_per_pool_tree,
            physical_aarch64_with_a_very_long_pool_tree_name: {
                pool: 'ma-efremoff',
                weight: 1,
            },
        },
    },
};

function makeGetOperationHandler(data: OperationEditAttributes) {
    return http.get(getOperationUrl, () => Response.json(data));
}

export const getOperationHandler = makeGetOperationHandler(operation);
export const getTerminalOperationHandler = makeGetOperationHandler(terminalOperation);
export const getLongPoolTreeOperationHandler = makeGetOperationHandler(longPoolTreeOperation);

export const patchOperationSpecHandler = http.post(
    `https://${TEST_CLUSTER}/api/v3/patch_op_spec`,
    () => new Response(null, {status: 200}),
);

export const updateOperationParametersHandler = http.post(
    `https://${TEST_CLUSTER}/api/v3/update_op_parameters`,
    () => new Response(null, {status: 200}),
);

export const patchOperationSpecErrorHandler = http.post(
    `https://${TEST_CLUSTER}/api/v3/patch_op_spec`,
    () =>
        Response.json(
            {code: 1, message: 'Failed to update the operation specification'},
            {status: 500},
        ),
);
