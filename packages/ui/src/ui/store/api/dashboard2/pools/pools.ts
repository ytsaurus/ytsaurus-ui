import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';

import {ytApiV3} from '../../../../rum/rum-wrap-api';

export type PoolQueryParams = {
    tree: string;
    pool: string;
};

export type PoolsQueryArgs = {
    id: string;
    type: 'favourite' | 'usable' | 'custom';
    favouriteList: {path: string}[];
    customList: PoolQueryParams[];
};

function parseStringToTreePool({path}: {path: string}) {
    const startIdx = path.indexOf('[');
    const endIdx = path.indexOf(']');

    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        return {tree: '', pool: ''};
    }

    const pool = path.slice(0, startIdx);
    const tree = path.slice(startIdx + 1, endIdx);

    return {tree, pool};
}

const QUOTA_LIMIT = 100;

type Resources = {
    cpu?: number;
    gpu?: number;
    user_memory?: number;
};

export type DashboardPoolsResponse = {
    max_operation_count?: number;
    running_operation_count?: number;
    estimated_guarantee_resources?: Resources;
    resource_usage?: Resources;
};

export async function fetchPools(args: PoolsQueryArgs) {
    try {
        const {customList, favouriteList, type} = args;
        const queries =
            type === 'favourite' ? (favouriteList || []).map(parseStringToTreePool) : customList;
        const response = await ytApiV3.executeBatch<DashboardPoolsResponse>({
            parameters: {
                requests: map_(queries, ({tree, pool}) => ({
                    command: 'get' as const,
                    parameters: {
                        path: `//sys/scheduler/orchid/scheduler/pool_trees/${tree}/pools/${pool}`,
                    },
                })),
            },
        });

        const pools = map_(response, (item, index) => {
            const {output} = item;

            const operationsGuarantee = ypath.getValue(output, '/max_operation_count');
            const operationsUsage = ypath.getValue(output, '/running_operation_count');

            const guarantee = ypath.getValue(output, '/estimated_guarantee_resources');
            const usage = ypath.getValue(output, '/resource_usage');

            const cpu = {
                value:
                    (ypath.getValue(usage, '/cpu') / ypath.getValue(guarantee, '/cpu')) *
                    QUOTA_LIMIT,
                guarantee: ypath.getValue(guarantee, '/cpu'),
                usage: ypath.getValue(usage, '/cpu'),
            };

            const memory = {
                value:
                    (ypath.getValue(usage, '/user_memory') /
                        ypath.getValue(guarantee, '/user_memory')) *
                    QUOTA_LIMIT,
                guarantee: ypath.getValue(guarantee, '/user_memory'),
                usage: ypath.getValue(usage, '/user_memory'),
            };

            const gpu = {
                value:
                    (ypath.getValue(usage, '/gpu') / ypath.getValue(guarantee, '/gpu')) *
                    QUOTA_LIMIT,
                guarantee: ypath.getValue(guarantee, '/gpu'),
                usage: ypath.getValue(usage, '/gpu'),
            };

            const operations = {
                value: (operationsUsage / operationsGuarantee) * QUOTA_LIMIT,
                guarantee: operationsGuarantee,
                usage: operationsUsage,
            };

            return {
                general: {
                    pool: queries?.[index]?.pool || 'unknown',
                    tree: queries?.[index]?.tree || 'unknown',
                },
                cpu,
                gpu,
                memory,
                operations,
            };
        });

        return {data: pools};
    } catch (error) {
        return {error};
    }
}
