import _ from 'lodash';
import {createSelector} from 'reselect';

import {RootState} from '../../../store/reducers';
import {ROOT_POOL_NAME} from '../../../constants/scheduling';
import {flattenAttributes, preparePools} from '../../../utils/scheduling/scheduling';
import ypath from '../../../common/thor/ypath';
import {updatePoolChild} from '../../../utils/scheduling/pool-child';
import {getExpandedPoolsTree, getSchedulingOperations} from './expanded-pools';
import {getCluster} from '../../../store/selectors/global';
import {RumWrapper} from '../../../rum/rum-wrap-api';
import {RumMeasureTypes} from '../../../rum/rum-measure-types';
import {EMPTY_OBJECT} from '../../../constants/empty';

export const getTree = (state: RootState) => state.scheduling.scheduling.tree;
const getPoolsRaw = (state: RootState) => state.scheduling.scheduling.rawPools;
const getTreeAttributesRaw = (state: RootState) => state.scheduling.scheduling.rawTreeAttributes;
const getTreeResources = (state: RootState) => state.scheduling.scheduling.treeResources;

const getTreeAttributesFlatten = createSelector([getTreeAttributesRaw], (attrs) => {
    return flattenAttributes(attrs);
});

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
        return _.reduce(
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
    [getPoolsRaw, getOperationsFiltered, getTreeAttributesFlatten, getTreeResources, getCluster],
    (rawPools, rawOperations, attributes, treeResources, cluster) => {
        if (_.isEmpty(rawPools)) {
            return [];
        }

        const rumId = new RumWrapper(cluster, RumMeasureTypes.SCHEDULING);

        return rumId.wrap('prepareData', () => {
            return _.map(preparePools(rawPools!, rawOperations), (pool) => {
                const cypressAttributes = ypath.getValue(attributes)[pool.name];
                return updatePoolChild(pool, cypressAttributes, 'pool', treeResources);
            });
        });
    },
);

export const getSchedulingPoolsMapByName = createSelector(
    [getPoolsPrepared],
    (pools: Array<PoolInfo>) => {
        return _.reduce(
            pools,
            (acc, item) => {
                acc[item.name] = item;
                return acc;
            },
            {} as Record<string, PoolInfo>,
        );
    },
);

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

function calcChildrenIntegrals(pool: PoolInfo, dst: Record<PoolName, PoolExtraInfo>) {
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
    attributes: object;
    cypressAttributes: object;
    flowCPU: number;
    burstCPU: number;
    flowGPU: number;
    integralType?: string;
    mode?: string;

    operationCount?: number;
    maxOperationCount?: number;
    maxRunningOperationCount?: number;

    pool: string;
}

export interface PoolInfo extends Omit<OperationInfo, 'type' | 'pool'> {
    type: 'pool';
    children?: Array<PoolInfo>;
    leaves: Array<OperationInfo>;
}

export const getPools = createSelector(
    [getPoolsPrepared, getSchedulingPoolsExtraInfo],
    (pools, extras) => {
        const res = _.map(pools, (item) => {
            const itemExtra = extras[item.name] || {};
            return Object.assign(item, itemExtra);
        });
        return res;
    },
);
