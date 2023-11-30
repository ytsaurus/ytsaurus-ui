import _ from 'lodash';
import ypath from '../../common/thor/ypath';
import {ROOT_POOL_NAME} from '../../constants/scheduling';
import {appendInnerErrors} from '../errors';

const RESOURCE_LIMIT_MAPPER = {
    user_memory: 'memory',
};

function preparePoolChildResource(data, type, treeResources, resource) {
    const attributes = data.attributes;

    if (data.name === ROOT_POOL_NAME) {
        data.resources[resource] = {
            guaranteed: ypath.getNumber(treeResources, '/resource_limits/' + resource),
            usage: ypath.getNumber(treeResources, '/resource_usage/' + resource),
        };
    } else {
        const min = ypath.getNumber(attributes, '/strong_guarantee_resources/' + resource);
        const usage = ypath.getNumber(attributes, '/resource_usage/' + resource);
        const demand = ypath.getNumber(attributes, '/resource_demand/' + resource);
        const guaranteed = ypath.getNumber(
            attributes,
            '/promised_fair_share_resources/' + resource,
        );

        const limitResource = RESOURCE_LIMIT_MAPPER[resource] || resource;
        const limit = ypath.getNumber(data.cypressAttributes, '/resource_limits/' + limitResource);

        const treeLimit = ypath.getNumber(treeResources, '/resource_limits/' + resource);
        const detailed =
            treeLimit * ypath.getNumber(attributes, '/detailed_fair_share/total/' + limitResource);

        data.resources[resource] = {
            min,
            guaranteed,
            usage,
            demand,
            limit,
            detailed,
        };
    }

    return data;
}

export function updatePoolChild(data, cypressData, type, treeResources) {
    try {
        const attributes = data.attributes;
        const cypressAttributes = ypath.getAttributes(cypressData);

        data.cypressAttributes = cypressAttributes;
        data.type = type;

        if (data.type === 'pool') {
            if (typeof attributes === 'undefined' && data.parent) {
                console.error(
                    'Pool "%s" without attributes inited by "%s"',
                    data.name,
                    data._initedBy,
                );
            }

            data.mode = ypath.getValue(attributes, '/mode');

            data.leaves = _.map(data.leaves, (leaf) => {
                return updatePoolChild(leaf, {}, 'operation', treeResources);
            });

            const child_pool_count = ypath.getNumber(attributes, '/child_pool_count');
            if (child_pool_count > 0 && !data.children.length) {
                for (let i = 0; i < child_pool_count; ++i) {
                    data.children.push({
                        parent: data.name,
                        type: 'pool',
                        name: `#key_${data.name}_${i}`,
                        attributes: {},
                        leaves: [],
                        incomplete: true,
                    });
                }
            }

            if (!data.leaves?.length) {
                data.pool_operation_count = ypath.getNumber(
                    attributes,
                    '/pool_operation_count',
                    NaN,
                );
                if (data.pool_operation_count > 0) {
                    const emptyOp = updatePoolChild(
                        {attributes: {}},
                        {},
                        'operation',
                        treeResources,
                    );
                    data.leaves = [];
                    for (let i = 0; i < data.pool_operation_count; ++i) {
                        data.leaves.push({
                            ...emptyOp,
                            name: `##fake_operation_${data.name}_${i}`,
                        });
                    }
                }
            }

            // Operations
            data.operationCount = ypath.getNumber(attributes, '/operation_count');
            data.maxOperationCount = ypath.getNumber(attributes, '/max_operation_count');
            data.maxOperationCountEdited = ypath.getNumber(
                cypressAttributes,
                '/max_operation_count',
            );
            data.runningOperationCount = ypath.getNumber(attributes, '/running_operation_count');
            data.maxRunningOperationCount = ypath.getNumber(
                attributes,
                '/max_running_operation_count',
            );
            data.maxRunningOperationCountEdited = ypath.getNumber(
                cypressAttributes,
                '/max_running_operation_count',
            );
        }

        data.id = data.name;
        data.starvation_status = ypath.getValue(attributes, '/starvation_status');

        // General
        data.weight = ypath.getNumber(attributes, '/weight');
        data.weightEdited = ypath.getNumber(cypressAttributes, '/weight');
        data.minShareRatio = ypath.getNumber(attributes, '/min_share_ratio');
        data.maxShareRatio = ypath.getNumber(attributes, '/max_share_ratio');
        data.fairShareRatio = ypath.getNumber(attributes, '/fair_share_ratio');
        data.fifoIndex = ypath.getNumber(attributes, '/fifo_index');
        data.usageRatio = ypath.getNumber(attributes, '/usage_ratio');
        data.demandRatio = ypath.getNumber(attributes, '/demand_ratio');
        data.isEphemeral = ypath.getBoolean(attributes, '/is_ephemeral');

        data.integralType = ypath.getValue(attributes, '/integral_guarantee_type');
        const userDefinedBurstCPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/burst_guarantee_resources/cpu',
            NaN,
        );
        data.burstCPU = ypath.getNumber(
            attributes,
            '/specified_burst_guarantee_resources/cpu',
            userDefinedBurstCPU,
        );
        const userDefinedFlowCPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/resource_flow/cpu',
            NaN,
        );
        data.flowCPU = ypath.getNumber(
            attributes,
            '/specified_resource_flow/cpu',
            userDefinedFlowCPU,
        );
        const userDefinedFlowGPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/resource_flow/gpu',
            NaN,
        );
        data.flowGPU = ypath.getNumber(
            attributes,
            '/specified_resource_flow/gpu',
            userDefinedFlowGPU,
        );

        data.accumulated = ypath.getValue(attributes, '/accumulated_resource_ratio_volume');
        data.accumulatedCpu = ypath.getValue(attributes, '/accumulated_resource_volume/cpu');
        data.burstDuration = ypath.getValue(attributes, '/estimated_burst_usage_duration_sec');

        const fifoSortParams = _.map(
            ypath.getValue(cypressAttributes, '/fifo_sort_parameters'),
            (param) => ypath.getValue(param),
        );
        data.fifoSortParams =
            fifoSortParams.length > 0
                ? fifoSortParams
                : ['start_time', 'weight', 'pending_job_count'];
        data.abc = ypath.getValue(attributes, '/abc') || {};
        data.forbidImmediateOperations =
            ypath.getBoolean(cypressAttributes, '/forbid_immediate_operations') || false;
        data.createEphemeralSubpools =
            ypath.getBoolean(cypressAttributes, '/create_ephemeral_subpools') || false;

        // Resources
        data.dominantResource = ypath.getValue(attributes, '/dominant_resource');

        data.resources = {};

        preparePoolChildResource(data, type, treeResources, 'cpu');
        preparePoolChildResource(data, type, treeResources, 'user_memory');
        preparePoolChildResource(data, type, treeResources, 'gpu');
        preparePoolChildResource(data, type, treeResources, 'user_slots');

        return data;
    } catch (e) {
        throw appendInnerErrors(e, {
            message: `An error occured while parsing pool "${data.name}" data.`,
        });
    }
}
