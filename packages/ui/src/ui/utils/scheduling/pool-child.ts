import map_ from 'lodash/map';

import ypath from '../../common/thor/ypath';
import {ROOT_POOL_NAME} from '../../constants/scheduling';
import {type TreeNode} from '../../common/hammer/tree-list';
import {type TreeResources} from '../../store/reducers/scheduling/scheduling';
import {
    type OperationInfo,
    type PoolInfo,
    type PoolResourceType,
} from '../../store/selectors/scheduling/scheduling-pools';

import {appendInnerErrors} from '../../utils/errors';

const RESOURCE_LIMIT_MAPPER: Partial<
    Record<keyof Required<PoolData<'pool'>>['resources'], 'memory'>
> = {
    user_memory: 'memory',
};

function preparePoolChildResource<T extends 'pool' | 'operation'>(
    accData: PoolOrOperation<T>,
    _type: T,
    treeResources: TreeResources,
    resource: keyof Required<PoolData<'pool'>>['resources'],
) {
    if (!accData.resources) {
        return;
    }
    const attributes = accData.attributes;

    if (accData.name === ROOT_POOL_NAME) {
        accData.resources[resource] = {
            guaranteed: ypath.getNumber(treeResources, '/resource_limits/' + resource),
            usage: ypath.getNumber(treeResources, '/resource_usage/' + resource),
        };
    } else {
        const min = ypath.getNumber(attributes, '/strong_guarantee_resources/' + resource);
        const usage = ypath.getNumber(attributes, '/resource_usage/' + resource);
        const demand = ypath.getNumber(attributes, '/resource_demand/' + resource);
        const guaranteed = ypath.getNumber(
            attributes,
            '/estimated_guarantee_resources/' + resource,
        );

        const effectiveGuaranteed = ypath.getNumber(
            attributes,
            '/effective_strong_guarantee_resources/' + resource,
        );

        const limitResource = RESOURCE_LIMIT_MAPPER[resource] || resource;
        const resourceLimit = ypath.getNumber(
            accData.cypressAttributes,
            '/resource_limits/' + limitResource,
        );
        const specifiedResourceLimit = ypath.getNumber(
            accData.attributes,
            '/specified_resource_limits/' + limitResource,
        );

        const treeLimit = ypath.getNumber(treeResources, '/resource_limits/' + resource);
        const detailed =
            treeLimit * ypath.getNumber(attributes, '/detailed_fair_share/total/' + limitResource);

        accData.resources[resource] = {
            min,
            guaranteed,
            effectiveGuaranteed,
            usage,
            demand,
            limit: resourceLimit || specifiedResourceLimit,
            detailed,
        };
    }
}

export type PoolData<T extends 'pool' | 'operation'> = {
    type: T;
    pool?: string;
    isAggregationRow?: boolean;
    attributes?: {
        accumulated_resource_volume?: Record<PoolResourceType, number | undefined>;
        integral_pool_capacity?: Record<PoolResourceType, number | undefined>;
    };
    cypressAttributes?: unknown;
    mode?: 'fair_share' | 'fifo';
    pool_operation_count?: number;
    incomplete?: boolean;
    operationCount?: number;
    maxOperationCount?: number;
    maxOperationCountEdited?: number;

    lightweightRunningOperationCount?: number;
    runningOperationCount?: number;
    maxRunningOperationCount?: number;
    maxRunningOperationCountEdited?: number;

    id?: string;
    starvation_status?: string;
    weight?: number;
    weightEdited?: number;
    minShareRatio?: number;
    maxShareRatio?: number;
    fairShareRatio?: number;
    fifoIndex?: number;
    usageRatio?: number;
    demandRatio?: number;
    isEphemeral?: boolean;
    isEffectiveLightweight?: boolean;

    integralType?: string;
    burstCPU?: number;
    flowCPU?: number;
    flowGPU?: number;

    accumulated?: number;
    accumulatedCpu?: number;
    burstDuration?: number;

    fifoSortParams?: Array<'start_time' | 'weight' | 'pending_job_count'>;

    abc?: {id?: number; slug?: string};
    forbidImmediateOperations?: boolean;
    createEphemeralSubpools?: boolean;

    dominantResource?: 'cpu' | 'gpu';

    resources?: Partial<Record<'cpu' | 'gpu' | 'user_memory' | 'user_slots', PoolResources>>;

    operationType?: string;
    user?: string;
    startTime?: string;

    childrenFlowCPU?: number;
    childrenBurstCPU?: number;
};

export type PoolResources = {
    min?: number;
    guaranteed?: number;
    effectiveGuaranteed?: number;
    usage?: number;
    demand?: number;
    limit?: number;
    detailed?: number;
};

export type PoolTreeNode = TreeNode<
    Partial<PoolInfo>,
    Partial<OperationInfo>,
    PoolData<'pool'>,
    PoolData<'operation'>
>;

export type PoolLeafNode = PoolTreeNode['leaves'][number];

export type SchedulingRowData = PoolTreeNode | PoolLeafNode;

function isPoolItem(item: PoolTreeNode | PoolLeafNode): item is PoolTreeNode {
    return item.type === 'pool';
}

export type PoolOrOperation<T extends 'pool' | 'operation'> = T extends 'pool'
    ? PoolTreeNode
    : PoolLeafNode;

export function updatePoolChild<T extends 'pool' | 'operation'>(
    accData: PoolOrOperation<T>,
    cypressData: unknown,
    type: T,
    treeResources: TreeResources,
): PoolOrOperation<T> {
    try {
        const attributes = accData.attributes;
        const cypressAttributes = ypath.getAttributes(cypressData);

        accData.cypressAttributes = cypressAttributes;
        accData.type = type;

        if (isPoolItem(accData)) {
            if (typeof attributes === 'undefined' && accData.parent) {
                // eslint-disable-next-line no-console
                console.error(
                    'Pool "%s" without attributes inited by "%s"',
                    accData.name,
                    accData._initedBy,
                );
            }

            accData.mode = ypath.getValue(attributes, '/mode');

            accData.leaves = map_(accData.leaves, (leaf) => {
                const res = updatePoolChild(
                    Object.assign(leaf, {pool: accData.name}),
                    {},
                    'operation',
                    treeResources,
                );
                return res;
            });

            const child_pool_count = ypath.getNumber(attributes, '/child_pool_count');
            if (child_pool_count > 0 && !accData.children.length) {
                for (let i = 0; i < child_pool_count; ++i) {
                    accData.children.push({
                        parent: accData.name,
                        type: 'pool',
                        name: `#key_${accData.name}_${i}`,
                        attributes: {},
                        leaves: [],
                        incomplete: true,
                        children: [],
                    });
                }
            }

            if (!accData.leaves?.length) {
                accData.pool_operation_count = ypath.getNumber(
                    attributes,
                    '/pool_operation_count',
                    NaN,
                );
                if (accData.pool_operation_count! > 0) {
                    const emptyOp = updatePoolChild(
                        {
                            attributes: {},
                            isLeafNode: true,
                            name: '',
                            type: 'operation',
                            pool: accData.name,
                        },
                        {},
                        'operation',
                        treeResources,
                    );
                    accData.leaves = [];
                    for (let i = 0; i < accData.pool_operation_count!; ++i) {
                        accData.leaves.push({
                            ...emptyOp,
                            name: `##fake_operation_${accData.name}_${i}`,
                            pool: accData.name,
                        });
                    }
                }
            }

            // Operations
            accData.operationCount = ypath.getNumber(attributes, '/operation_count');
            accData.maxOperationCount = ypath.getNumber(attributes, '/max_operation_count');
            accData.maxOperationCountEdited = ypath.getNumber(
                cypressAttributes,
                '/max_operation_count',
            );
            accData.lightweightRunningOperationCount = ypath.getNumber(
                attributes,
                '/lightweight_running_operation_count',
            );
            accData.runningOperationCount = ypath.getNumber(attributes, '/running_operation_count');
            accData.maxRunningOperationCount = ypath.getNumber(
                attributes,
                '/max_running_operation_count',
            );
            accData.maxRunningOperationCountEdited = ypath.getNumber(
                cypressAttributes,
                '/max_running_operation_count',
            );
        }

        if (type === 'operation') {
            accData.operationType = ypath.getValue(attributes, '/type');
            accData.user = ypath.getValue(attributes, '/user');
            accData.startTime = ypath.getValue(attributes, '/start_time');
        }

        accData.id = accData.name;
        accData.starvation_status = ypath.getValue(attributes, '/starvation_status');

        // General
        accData.weight = ypath.getNumber(attributes, '/weight');
        accData.weightEdited = ypath.getNumber(cypressAttributes, '/weight');
        accData.minShareRatio = ypath.getNumber(attributes, '/min_share_ratio');
        accData.maxShareRatio = ypath.getNumber(attributes, '/max_share_ratio');
        accData.fairShareRatio = ypath.getNumber(attributes, '/fair_share_ratio');
        accData.fifoIndex = ypath.getNumber(attributes, '/fifo_index');
        accData.usageRatio = ypath.getNumber(attributes, '/usage_ratio');
        accData.demandRatio = ypath.getNumber(attributes, '/demand_ratio');
        accData.isEphemeral = ypath.getBoolean(attributes, '/is_ephemeral');
        accData.isEffectiveLightweight = ypath.getBoolean(
            attributes,
            '/effective_lightweight_operations_enabled',
        );

        accData.integralType = ypath.getValue(attributes, '/integral_guarantee_type');
        const userDefinedBurstCPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/burst_guarantee_resources/cpu',
            NaN,
        );
        accData.burstCPU = ypath.getNumber(
            attributes,
            '/specified_burst_guarantee_resources/cpu',
            userDefinedBurstCPU,
        );
        const userDefinedFlowCPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/resource_flow/cpu',
            NaN,
        );
        accData.flowCPU = ypath.getNumber(
            attributes,
            '/specified_resource_flow/cpu',
            userDefinedFlowCPU,
        );
        const userDefinedFlowGPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/resource_flow/gpu',
            NaN,
        );
        accData.flowGPU = ypath.getNumber(
            attributes,
            '/specified_resource_flow/gpu',
            userDefinedFlowGPU,
        );

        accData.accumulated = ypath.getValue(attributes, '/accumulated_resource_ratio_volume');
        accData.accumulatedCpu = ypath.getValue(attributes, '/accumulated_resource_volume/cpu');
        accData.burstDuration = ypath.getValue(attributes, '/estimated_burst_usage_duration_sec');

        const fifoSortParams = map_(
            ypath.getValue(attributes, '/fifo_sort_parameters') ||
                ypath.getValue(cypressAttributes, '/fifo_sort_parameters'),
            (param) => ypath.getValue(param),
        );
        accData.fifoSortParams =
            fifoSortParams.length > 0
                ? fifoSortParams
                : ['start_time', 'weight', 'pending_job_count'];
        accData.abc = ypath.getValue(attributes, '/abc') || {};
        accData.forbidImmediateOperations =
            ypath.getBoolean(cypressAttributes, '/forbid_immediate_operations') || false;
        accData.createEphemeralSubpools =
            ypath.getBoolean(cypressAttributes, '/create_ephemeral_subpools') || false;

        // Resources
        accData.dominantResource = ypath.getValue(attributes, '/dominant_resource');

        accData.resources = {};

        preparePoolChildResource(accData, type, treeResources, 'cpu');
        preparePoolChildResource(accData, type, treeResources, 'user_memory');
        preparePoolChildResource(accData, type, treeResources, 'gpu');
        preparePoolChildResource(accData, type, treeResources, 'user_slots');

        return accData;
    } catch (e) {
        throw appendInnerErrors(e, {
            message: `An error occured while parsing pool "${accData.name}" data.`,
        });
    }
}
