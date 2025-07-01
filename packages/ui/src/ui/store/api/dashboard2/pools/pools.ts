import map_ from 'lodash/map';

import ypath from '../../../../common/thor/ypath';

import {ytApiV3} from '../../../../rum/rum-wrap-api';

export type PoolQueryParams = {
    tree: string;
    pool: string;
};

export type PoolsQueryArgs = {
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

const QUOTA_LIMIT = 50;

export async function fetchPools(args: PoolsQueryArgs) {
    try {
        const {customList, favouriteList, type} = args;
        const queries =
            type === 'favourite' ? (favouriteList || []).map(parseStringToTreePool) : customList;
        const response = await ytApiV3.executeBatch({
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

            const operationsGarantee = ypath.getValue(output, '/max_operation_count');
            const operationsUsage = ypath.getValue(output, '/running_operation_count');

            const garantee = ypath.getValue(output, '/estimated_guarantee_resources');
            const usage = ypath.getValue(output, '/resource_usage');

            const cpu = {
                value:
                    (ypath.getValue(usage, '/cpu') / ypath.getValue(garantee, '/cpu')) *
                    QUOTA_LIMIT,
                garantee: ypath.getValue(garantee, '/cpu'),
                usage: ypath.getValue(usage, '/cpu'),
            };

            const memory = {
                value:
                    (ypath.getValue(usage, '/user_memory') /
                        ypath.getValue(garantee, '/user_memory')) *
                    50,
                garantee: ypath.getValue(garantee, '/user_memory'),
                usage: ypath.getValue(usage, '/user_memory'),
            };

            const gpu = {
                value:
                    (ypath.getValue(usage, '/gpu') / ypath.getValue(garantee, '/gpu')) *
                    QUOTA_LIMIT,
                garantee: ypath.getValue(garantee, '/gpu'),
                usage: ypath.getValue(usage, '/gpu'),
            };

            const operations = {
                value: (operationsUsage / operationsGarantee) * QUOTA_LIMIT,
                garantee: operationsGarantee,
                usage: operationsUsage,
            };

            return {
                general: {
                    pool: queries?.[index]?.pool || 'unkwown',
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
