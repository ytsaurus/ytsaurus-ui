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
    draftData: PoolOrOperation<T>,
    _type: T,
    treeResources: TreeResources,
    resource: keyof Required<PoolData<'pool'>>['resources'],
) {
    if (!draftData.resources) {
        return;
    }
    const attributes = draftData.attributes;

    if (draftData.name === ROOT_POOL_NAME) {
        draftData.resources[resource] = {
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
            draftData.cypressAttributes,
            '/resource_limits/' + limitResource,
        );
        const specifiedResourceLimit = ypath.getNumber(
            draftData.attributes,
            '/specified_resource_limits/' + limitResource,
        );

        const treeLimit = ypath.getNumber(treeResources, '/resource_limits/' + resource);
        const detailed =
            treeLimit * ypath.getNumber(attributes, '/detailed_fair_share/total/' + limitResource);

        draftData.resources[resource] = {
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
    draftData: PoolOrOperation<T>,
    cypressData: unknown,
    type: T,
    treeResources: TreeResources,
): PoolOrOperation<T> {
    try {
        const attributes = draftData.attributes;
        const cypressAttributes = ypath.getAttributes(cypressData);

        draftData.cypressAttributes = cypressAttributes;
        draftData.type = type;

        if (isPoolItem(draftData)) {
            if (typeof attributes === 'undefined' && draftData.parent) {
                // eslint-disable-next-line no-console
                console.error(
                    'Pool "%s" without attributes inited by "%s"',
                    draftData.name,
                    draftData._initedBy,
                );
            }

            draftData.mode = ypath.getValue(attributes, '/mode');

            draftData.leaves = map_(draftData.leaves, (leaf) => {
                const res = updatePoolChild(
                    Object.assign(leaf, {pool: draftData.name}),
                    {},
                    'operation',
                    treeResources,
                );
                return res;
            });

            const child_pool_count = ypath.getNumber(attributes, '/child_pool_count');
            if (child_pool_count > 0 && !draftData.children.length) {
                for (let i = 0; i < child_pool_count; ++i) {
                    draftData.children.push({
                        parent: draftData.name,
                        type: 'pool',
                        name: `#key_${draftData.name}_${i}`,
                        attributes: {},
                        leaves: [],
                        incomplete: true,
                        children: [],
                    });
                }
            }

            if (!draftData.leaves?.length) {
                draftData.pool_operation_count = ypath.getNumber(
                    attributes,
                    '/pool_operation_count',
                    NaN,
                );
                if (draftData.pool_operation_count! > 0) {
                    const emptyOp = updatePoolChild(
                        {
                            attributes: {},
                            isLeafNode: true,
                            name: '',
                            type: 'operation',
                            pool: draftData.name,
                        },
                        {},
                        'operation',
                        treeResources,
                    );
                    draftData.leaves = [];
                    for (let i = 0; i < draftData.pool_operation_count!; ++i) {
                        draftData.leaves.push({
                            ...emptyOp,
                            name: `##fake_operation_${draftData.name}_${i}`,
                            pool: draftData.name,
                        });
                    }
                }
            }

            // Operations
            draftData.operationCount = ypath.getNumber(attributes, '/operation_count');
            draftData.maxOperationCount = ypath.getNumber(attributes, '/max_operation_count');
            draftData.maxOperationCountEdited = ypath.getNumber(
                cypressAttributes,
                '/max_operation_count',
            );
            draftData.lightweightRunningOperationCount = ypath.getNumber(
                attributes,
                '/lightweight_running_operation_count',
            );
            draftData.runningOperationCount = ypath.getNumber(
                attributes,
                '/running_operation_count',
            );
            draftData.maxRunningOperationCount = ypath.getNumber(
                attributes,
                '/max_running_operation_count',
            );
            draftData.maxRunningOperationCountEdited = ypath.getNumber(
                cypressAttributes,
                '/max_running_operation_count',
            );
        }

        if (type === 'operation') {
            draftData.operationType = ypath.getValue(attributes, '/type');
            draftData.user = ypath.getValue(attributes, '/user');
            draftData.startTime = ypath.getValue(attributes, '/start_time');
        }

        draftData.id = draftData.name;
        draftData.starvation_status = ypath.getValue(attributes, '/starvation_status');

        // General
        draftData.weight = ypath.getNumber(attributes, '/weight');
        draftData.weightEdited = ypath.getNumber(cypressAttributes, '/weight');
        draftData.minShareRatio = ypath.getNumber(attributes, '/min_share_ratio');
        draftData.maxShareRatio = ypath.getNumber(attributes, '/max_share_ratio');
        draftData.fairShareRatio = ypath.getNumber(attributes, '/fair_share_ratio');
        draftData.fifoIndex = ypath.getNumber(attributes, '/fifo_index');
        draftData.usageRatio = ypath.getNumber(attributes, '/usage_ratio');
        draftData.demandRatio = ypath.getNumber(attributes, '/demand_ratio');
        draftData.isEphemeral = ypath.getBoolean(attributes, '/is_ephemeral');
        draftData.isEffectiveLightweight = ypath.getBoolean(
            attributes,
            '/effective_lightweight_operations_enabled',
        );

        draftData.integralType = ypath.getValue(attributes, '/integral_guarantee_type');
        const userDefinedBurstCPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/burst_guarantee_resources/cpu',
            NaN,
        );
        draftData.burstCPU = ypath.getNumber(
            attributes,
            '/specified_burst_guarantee_resources/cpu',
            userDefinedBurstCPU,
        );
        const userDefinedFlowCPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/resource_flow/cpu',
            NaN,
        );
        draftData.flowCPU = ypath.getNumber(
            attributes,
            '/specified_resource_flow/cpu',
            userDefinedFlowCPU,
        );
        const userDefinedFlowGPU = ypath.getNumber(
            cypressAttributes,
            '/integral_guarantees/resource_flow/gpu',
            NaN,
        );
        draftData.flowGPU = ypath.getNumber(
            attributes,
            '/specified_resource_flow/gpu',
            userDefinedFlowGPU,
        );

        draftData.accumulated = ypath.getValue(attributes, '/accumulated_resource_ratio_volume');
        draftData.accumulatedCpu = ypath.getValue(attributes, '/accumulated_resource_volume/cpu');
        draftData.burstDuration = ypath.getValue(attributes, '/estimated_burst_usage_duration_sec');

        const fifoSortParams = map_(
            ypath.getValue(attributes, '/fifo_sort_parameters') ||
                ypath.getValue(cypressAttributes, '/fifo_sort_parameters'),
            (param) => ypath.getValue(param),
        );
        draftData.fifoSortParams =
            fifoSortParams.length > 0
                ? fifoSortParams
                : ['start_time', 'weight', 'pending_job_count'];
        draftData.abc = ypath.getValue(attributes, '/abc') || {};
        draftData.forbidImmediateOperations =
            ypath.getBoolean(cypressAttributes, '/forbid_immediate_operations') || false;
        draftData.createEphemeralSubpools =
            ypath.getBoolean(cypressAttributes, '/create_ephemeral_subpools') || false;

        // Resources
        draftData.dominantResource = ypath.getValue(attributes, '/dominant_resource');

        draftData.resources = {};

        preparePoolChildResource(draftData, type, treeResources, 'cpu');
        preparePoolChildResource(draftData, type, treeResources, 'user_memory');
        preparePoolChildResource(draftData, type, treeResources, 'gpu');
        preparePoolChildResource(draftData, type, treeResources, 'user_slots');

        return draftData;
    } catch (e) {
        throw appendInnerErrors(e, {
            message: `An error occured while parsing pool "${draftData.name}" data.`,
        });
    }
}
