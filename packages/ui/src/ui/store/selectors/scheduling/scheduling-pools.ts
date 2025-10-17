import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import {createSelector} from 'reselect';

import {RootState} from '../../../store/reducers';
import {ROOT_POOL_NAME} from '../../../constants/scheduling';
import {preparePools} from '../../../utils/scheduling/scheduling';
import ypath from '../../../common/thor/ypath';
import {updatePoolChild} from '../../../utils/scheduling/pool-child';
import {
    getExpandedPoolCypressData,
    getExpandedPoolsTree,
    getSchedulingOperations,
} from './expanded-pools';
import {getCluster} from '../../../store/selectors/global';
import {RumWrapper} from '../../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {EMPTY_OBJECT} from '../../../constants/empty';

export const getTree = (state: RootState) => state.scheduling.scheduling.tree;
const getPoolsRaw = (state: RootState) => state.scheduling.expandedPools.rawPools;
const getTreeResources = (state: RootState) => state.scheduling.scheduling.treeResources;

const getSchedulingTreeOperations = createSelector(
    [getSchedulingOperations, getExpandedPoolsTree, getTree],
    (rawOperations, expandedPoolsTree, tree) => {
        if (tree !== expandedPoolsTree) {
            return EMPTY_OBJECT as typeof rawOperations;
        }

        return rawOperations;
    },
);

const getOperationsFiltered = createSelector(
    [getPoolsRaw, getSchedulingTreeOperations],
    (rawPools, rawOperations) => {
        return reduce_(
            rawOperations,
            (acc, item, operationId) => {
                if (rawPools[item.pool]) {
                    acc[operationId] = item;
                }
                return acc;
            },
            {} as typeof rawOperations,
        );
    },
);

const getPoolsPrepared = createSelector(
    [getPoolsRaw, getOperationsFiltered, getExpandedPoolCypressData, getTreeResources, getCluster],
    (rawPools, rawOperations, attributes, treeResources, cluster) => {
        if (isEmpty_(rawPools)) {
            return [];
        }

        const rumId = new RumWrapper(cluster, RumMeasureTypes.SCHEDULING);

        return rumId.wrap('prepareData', () => {
            const preparedPools = preparePools(rawPools!, rawOperations);
            return map_(preparedPools, (pool) => {
                const cypressAttributes = ypath.getValue(attributes)[pool.name];
                return updatePoolChild(
                    Object.assign(pool, {type: 'pool' as const}),
                    cypressAttributes,
                    'pool',
                    treeResources,
                );
            });
        });
    },
);

export const getSchedulingPoolsMapByName = createSelector([getPoolsPrepared], (pools) => {
    return reduce_(
        pools,
        (acc, item) => {
            acc[item.name] = item;
            return acc;
        },
        {} as Record<string, (typeof pools)[number]>,
    );
});

export const getSchedulingPoolsExtraInfo = createSelector(
    [getSchedulingPoolsMapByName],
    (poolsMap) => {
        const root = poolsMap[ROOT_POOL_NAME];
        if (!root) {
            return {};
        }

        const res: Record<string, PoolExtraInfo> = {};
        calcChildrenIntegrals(root, res);
        return res;
    },
);

type PoolName = string;

function calcChildrenIntegrals(
    pool: {
        children: Array<typeof pool>;
        name: string;
        flowCPU?: number;
        burstCPU?: number;
        childrenFlowCPU?: number;
        childrenBurstCPU?: number;
    },
    dst: Record<PoolName, PoolExtraInfo>,
) {
    const {children, name} = pool;
    if (!children?.length) {
        const res = (dst[name] = {
            childrenBurstCPU: 0,
            childrenFlowCPU: 0,
        });
        return res;
    }

    const res: PoolExtraInfo = {
        childrenFlowCPU: 0,
        childrenBurstCPU: 0,
    };
    for (let i = 0; i < children.length; ++i) {
        const item = children[i];
        const itemExtraInfo = calcChildrenIntegrals(item, dst);

        dst[item.name] = itemExtraInfo;

        res.childrenFlowCPU += item.flowCPU || 0 + itemExtraInfo.childrenFlowCPU;
        res.childrenBurstCPU += item.burstCPU || 0 + itemExtraInfo.childrenBurstCPU;
    }

    dst[name] = res;
    return res;
}

export interface PoolExtraInfo {
    childrenFlowCPU: number;
    childrenBurstCPU: number;
}

export interface OperationInfo {
    name: string;
    type: 'operation';
    parent: string;
    attributes: {title?: string; user?: string; type?: string};
    cypressAttributes: object;
    flowCPU: number;
    burstCPU: number;
    flowGPU: number;
    integralType?: string;
    mode?: 'fifo' | 'fair_share';

    operationCount?: number;
    maxOperationCount?: number;
    maxRunningOperationCount?: number;

    fifoIndex?: number;

    pool: string;

    title?: string;
    user?: never;

    child_pool_count?: number;
    pool_operation_count?: number;
}

export interface PoolInfo extends Omit<OperationInfo, 'type' | 'pool'> {
    type: 'pool';
    incomplete?: boolean;
    children?: Array<PoolInfo>;
    leaves: Array<OperationInfo>;
    isEphemeral?: boolean;
    resources?: PoolResources;
    weight?: number;
    minShareRatio?: number;
    maxShareRatio?: number;
    fairShareRatio?: number;
    usageRatio?: number;
    demandRatio?: number;
    dominantResource?: number;
    runningOperationCount?: number;
    operationCount?: number;
    maxOperationCount?: number;
    childrenBurstCPU?: number;
    childrenFlowCPU?: number;
    accumulated?: number;
    accumulatedCpu?: number;
    burstDuration?: number;
}

export type PoolResources = Partial<
    Record<'cpu' | 'gpu' | 'user_memory' | 'user_slots', PoolResourceDetails>
>;

export type PoolResourceType = keyof PoolResources;

export type PoolResourceDetails = {
    min?: number;
    usage?: number;
    limit?: number;
    demand?: number;
    detailed?: number;
    guaranteed?: number;
};

export const getPools = createSelector(
    [getPoolsPrepared, getSchedulingPoolsExtraInfo],
    (pools, extras) => {
        const res = map_(pools, (item) => {
            const itemExtra = extras[item.name] || {};
            return Object.assign(item, itemExtra);
        });
        return res;
    },
);
