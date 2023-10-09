import _ from 'lodash';
import ypath from '../../common/thor/ypath';
import {ROOT_POOL_NAME} from '../../constants/scheduling';
import {OperationInfo, PoolInfo} from '../../store/selectors/scheduling/scheduling-pools';
import {attachTreeLeaves, prepareTree} from '../../common/hammer/tree-list';

function getPool(pools: Array<PoolInfo>, name: string) {
    return _.find(pools, (pool) => pool.name === name);
}

export function prepareTrees(trees: Array<unknown>) {
    return _.map(trees, (tree) => ypath.getValue(tree, '')).sort();
}

export function prepareCurrentTree(defaultTree: unknown, trees: Array<string>, tree: string) {
    return tree !== '' && trees.indexOf(tree) !== -1
        ? tree
        : ypath.getValue(defaultTree, '') || trees[0];
}

export function preparePools(
    pools: Record<string, PoolInfo>,
    operations: Record<string, OperationInfo>,
) {
    const treeNodesMap = prepareTree<PoolInfo, OperationInfo>(pools, (entry: PoolInfo) =>
        ypath.getValue(entry, '/parent'),
    );

    attachTreeLeaves(treeNodesMap, operations, (operation: OperationInfo) =>
        ypath.getValue(operation, '/pool'),
    );

    return _.map(treeNodesMap);
}

export function computePathItems(pools: Array<PoolInfo>, name: string) {
    let pool: PoolInfo | undefined =
        getPool(pools, name) || ({parent: ROOT_POOL_NAME, name} as PoolInfo);
    const pathItems = [];

    // Unknown pool or dynamically created pool
    while (pool) {
        pathItems.unshift(pool.name);

        pool = getPool(pools, pool.parent);
    }

    return pathItems;
}

export function computePoolPath(pool: PoolInfo, pools: Array<PoolInfo>) {
    const partitions = [pool.name];
    let parent: string | undefined = pool.parent;

    while (parent && parent !== ROOT_POOL_NAME) {
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        const parentPool = _.find(pools, (item) => item.name === parent);
        partitions.unshift(parentPool?.name!);
        parent = parentPool?.parent;
    }

    return partitions.join('/');
}

/* eslint-disable prefer-const */
export function flattenAttributes(obj: any) {
    const toReturn: any = {};
    const object = ypath.getValue(obj);

    for (let i in object) {
        if (!Object.hasOwnProperty.call(object, i)) {
            continue;
        }

        const innerObject = ypath.getValue(object[i]);
        if (
            typeof innerObject === 'object' &&
            !Object.is(innerObject, null) &&
            Object.keys(innerObject).length > 0
        ) {
            toReturn[i] = object[i];

            const flatObject = flattenAttributes(object[i]);
            for (let x in flatObject) {
                if (!Object.hasOwnProperty.call(flatObject, x)) {
                    continue;
                }

                toReturn[x] = flatObject[x];
            }
        } else {
            toReturn[i] = object[i];
        }
    }

    return toReturn;
}

function getResourceLimit(pool: PoolInfo | undefined, limitKey: string): number | '' {
    const value = Number(ypath.getValue(pool, `/cypressAttributes/resource_limits/${limitKey}`));
    return isNaN(value) ? '' : value;
}

function prepareValueDetails(pool: PoolInfo | undefined, path: string) {
    if (!pool) {
        return {};
    }

    const value = Number(ypath.getValue(pool, path));
    const childrenSum = prepareMinGuaranteed(pool, path);

    return {
        value: isNaN(value) ? undefined : value,
        childrenSum: isNaN(childrenSum!) ? undefined : childrenSum,
    };
}

function prepareMinGuaranteed(pool?: PoolInfo, path = '') {
    const res = _.reduce(
        pool?.children,
        (sum, item) => {
            const tmp = Number(ypath.getValue(item, path) || 0);
            return isNaN(tmp) ? sum : tmp + firstValidNumber(sum, 0)!;
        },
        NaN,
    );
    return isNaN(res) ? undefined : res;
}

function firstValidNumber(...args: number[]) {
    for (let i = 0; i < args.length; ++i) {
        if (!isNaN(args[i])) {
            return args[i];
        }
    }
    return undefined;
}

export const INTEGRAL_GUARANTEES_PREFIX = 'integral_guarantees/';

export const POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR = {
    guaranteeType: INTEGRAL_GUARANTEES_PREFIX + 'guarantee_type',
    burstCpu: INTEGRAL_GUARANTEES_PREFIX + 'burst_guarantee_resources/cpu',
    burstRam: INTEGRAL_GUARANTEES_PREFIX + 'burst_guarantee_resources/memory',
    burstGpu: INTEGRAL_GUARANTEES_PREFIX + 'burst_guarantee_resources/gpu',
    flowCpu: INTEGRAL_GUARANTEES_PREFIX + 'resource_flow/cpu',
    flowRam: INTEGRAL_GUARANTEES_PREFIX + 'resource_flow/memory',
    flowGpu: INTEGRAL_GUARANTEES_PREFIX + 'resource_flow/gpu',
};

export const POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE = {
    cpuStrong: 'strong_guarantee_resources/cpu',
    gpuStrong: 'strong_guarantee_resources/gpu',
    memoryStrong: 'strong_guarantee_resources/memory',
    //userSlotsStrong: 'strong_guarantee_resources/user_slots',
};

export const POOL_GENERAL_TYPE_TO_ATTRIBUTE = {
    maxOperationCount: 'max_operation_count',
    maxRunningOperationCount: 'max_running_operation_count',
};

export const POOL_RESOURCE_TYPE_TO_ATTRIBUTE = {
    ...POOL_GENERAL_TYPE_TO_ATTRIBUTE,
    ...POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE,
    ...POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR,
};

export type PoolStrongResourceType = keyof typeof POOL_STRONG_RESOURCE_TYPE_TO_ATTRIBUTE;
export type PoolIntegralResourceType = keyof typeof POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR;
export type PoolGeneralResourceType = keyof typeof POOL_GENERAL_TYPE_TO_ATTRIBUTE;
export type PoolResourceType = keyof typeof POOL_RESOURCE_TYPE_TO_ATTRIBUTE;

export function getPoolResourceInfo(pool: PoolInfo, type: PoolResourceType) {
    const path = '/cypressAttributes/' + POOL_RESOURCE_TYPE_TO_ATTRIBUTE[type];
    return prepareValueDetails(pool, path);
}

export interface InitialPoolResourceInfo {
    limit?: number;
    source?: string;
}

export function getPoolResourceInitialValue(
    pool: PoolInfo | undefined,
    type: PoolResourceType,
    allowSource: boolean,
): InitialPoolResourceInfo {
    if (!pool) {
        return {};
    }
    const {value} = getPoolResourceInfo(pool, type);
    return {
        limit: value,
        source: allowSource ? pool.parent : undefined,
    };
}

export function getInitialValues(editItem: PoolInfo | undefined, allowedSources: Array<string>) {
    const slug = ypath.getValue(editItem, '/abc/slug');

    const allowSource = -1 !== _.indexOf(allowedSources, editItem?.parent);

    return {
        general: {
            name: editItem?.name,
            abcService: slug
                ? {
                      key: slug,
                      value: slug,
                      title: ypath.getValue(editItem, '/abc/name'),
                  }
                : undefined,
            parent: editItem?.parent,
            mode: editItem?.mode,
            weight: ypath.getNumber(editItem, '/cypressAttributes/weight'),
            maxOperationCount: Object.assign(
                getPoolResourceInitialValue(editItem, 'maxOperationCount', allowSource),
                {source: undefined},
            ),
            maxRunningOperationCount: Object.assign(
                getPoolResourceInitialValue(editItem, 'maxRunningOperationCount', allowSource),
                {source: undefined},
            ),
        },
        resourceGuarantee: {
            cpuStrong: getPoolResourceInitialValue(editItem, 'cpuStrong', allowSource),
            gpuStrong: getPoolResourceInitialValue(editItem, 'gpuStrong', allowSource),
            memoryStrong: getPoolResourceInitialValue(editItem, 'memoryStrong', allowSource),
            //userSlotsStrong: getPoolResourceInitialValue(editItem, 'userSlotsStrong', allowSource),
        },
        integralGuarantee: {
            guaranteeType:
                ypath.getValue(
                    editItem,
                    `/cypressAttributes/${POOL_INTEGRAL_GUARANTEE_FIELD_TO_ATTR.guaranteeType}`,
                ) || 'none',
            burstCpu: getPoolResourceInitialValue(editItem, 'burstCpu', allowSource),
            burstRam: getPoolResourceInitialValue(editItem, 'burstRam', allowSource),
            burstGpu: getPoolResourceInitialValue(editItem, 'burstGpu', allowSource),
            flowCpu: getPoolResourceInitialValue(editItem, 'flowCpu', allowSource),
            flowRam: getPoolResourceInitialValue(editItem, 'flowRam', allowSource),
            flowGpu: getPoolResourceInitialValue(editItem, 'flowGpu', allowSource),
        },
        resourceLimits: {
            cpu: getResourceLimit(editItem, 'cpu'),
            gpu: getResourceLimit(editItem, 'gpu'),
            memory: getResourceLimit(editItem, 'memory'),
            userSlots: getResourceLimit(editItem, 'user_slots'),
        },
        otherSettings: {
            forbidImmediateOperations: ypath.getBoolean(editItem, '/forbidImmediateOperations'),
            fifoSortParams: ypath.getValue(editItem, '/fifoSortParams'),
            createEphemeralSubpools: ypath.getBoolean(editItem, '/createEphemeralSubpools'),
        },
    };
}

export function isAbcPoolName(name?: string) {
    return name?.startsWith('abc:');
}

export function isTopLevelPool(pool?: PoolInfo) {
    const {parent} = pool || {};

    return parent === ROOT_POOL_NAME;
}
