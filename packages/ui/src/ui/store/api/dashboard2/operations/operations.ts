import {BaseQueryApi} from '@reduxjs/toolkit/query';

import map_ from 'lodash/map';
import forEach_ from 'lodash/forEach';

import {RootState} from '../../../../store/reducers';

import ypath from '../../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {NavigationFlowState, StatusLabelState} from '../../../../types/common/states';
import {BatchResultsItem, ListOperationsParams} from '../../../../../shared/yt-types';

type OperationState = StatusLabelState | NavigationFlowState;
type PoolValue = {tree: string; pool: string};

export type OperationProgressInfo = {
    completed: number;
    running: number;
    jobs: number;
    state?: OperationState;
};

type OperationsQueryArgs = {
    id: string;
    cluster: string;
    authorType: 'me' | 'custom';
    state?: string;
    authors?: Array<{value: string; type: string}>;
    pool?: Array<PoolValue>;
    limit?: number;
};

type OperationBriefSpec = {
    title?: string;
    [key: string]: unknown;
};

type OperationBriefProgress = {
    // FIX_ME: how completed can be {total: ..., ...} ?
    jobs?: Record<string, number> | Record<string, any>;
    [key: string]: unknown;
};

type SchedulingOperationsPerPoolTree = Record<string, {pool?: string; [key: string]: unknown}>;

type OperationRuntimeParameters = {
    scheduling_options_per_pool_tree?: SchedulingOperationsPerPoolTree;
    [key: string]: unknown;
};

type Operation = {
    id: string;
    state: OperationState;
    start_time?: string;
    brief_spec: OperationBriefSpec;
    brief_progress: OperationBriefProgress;
    authenticated_user: string;
    runtime_parameters: OperationRuntimeParameters;
    [key: string]: unknown;
};

export type DashboardOperationsResponse = {
    operations: Array<Operation>;
};

function createOperationRequestParameters(
    limit: number | undefined,
    operationState: string | undefined,
    pool: Array<PoolValue> | undefined,
): Partial<ListOperationsParams> {
    return {
        limit: limit ?? 10,
        state: operationState === 'all' ? undefined : operationState,
        pool: pool?.[0]?.pool?.length ? pool?.[0]?.pool : undefined,
        pool_tree: pool?.[0]?.tree?.length ? pool?.[0]?.tree : undefined,
    };
}

function createCustomAuthorRequests(
    authors: Array<{value: string; type: string}> | undefined,
    limit: number | undefined,
    operationState: string | undefined,
    pool: Array<PoolValue> | undefined,
) {
    if (!authors?.length) {
        return [
            {
                command: 'list_operations' as const,
                parameters: createOperationRequestParameters(limit, operationState, pool),
            },
        ];
    }

    return map_(authors, (item) => ({
        command: 'list_operations' as const,
        parameters: {
            ...createOperationRequestParameters(limit, operationState, pool),
            user: item?.value ? item?.value : undefined,
        } as ListOperationsParams,
    }));
}

function calculateProgress(jobs: Operation['brief_progress']['jobs']): OperationProgressInfo {
    const progress: OperationProgressInfo = {
        completed: 0,
        running: 0,
        jobs: 0,
    };

    if (jobs) {
        const completed =
            typeof jobs?.completed === 'object' ? jobs?.completed?.total : jobs?.completed;
        progress.completed = (completed / (jobs?.total || 1)) * 100;
        progress.running = ((jobs?.running || 1) / (jobs?.total || 1)) * 100;
        progress.jobs = progress.completed + progress.running;
    }

    return progress;
}

function extractPoolsFromTrees(
    trees: Operation['runtime_parameters']['scheduling_options_per_pool_tree'],
): {tree: string; pool: string[]}[] {
    const pools: {tree: string; pool: string[]}[] = [];

    if (!trees) {
        return [];
    }

    forEach_(Object.values(trees), (tree, idx) => {
        if (Object.keys(trees)?.[idx] && tree?.pool) {
            pools.push({tree: Object.keys(trees)[idx], pool: [tree.pool]});
        }
    });

    return pools;
}

function processOperation(operation: Operation) {
    const id: Operation['id'] = ypath.getValue(operation, '/id') ?? 'unknown';
    const title: string = ypath.getValue(operation, '/brief_spec/title') ?? id;
    const startTime: Operation['start_time'] = ypath.getValue(operation, '/start_time');
    const jobs: Operation['brief_progress']['jobs'] = ypath.getValue(
        operation,
        '/brief_progress/jobs',
    );

    const progress = calculateProgress(jobs);

    const operationState: Operation['state'] = ypath.getValue(operation, '/state');
    const operationUser: Operation['authenticated_user'] = ypath.getValue(
        operation,
        '/authenticated_user',
    );

    const trees: Operation['runtime_parameters']['scheduling_options_per_pool_tree'] =
        ypath.getValue(operation, '/runtime_parameters/scheduling_options_per_pool_tree');

    const pools = extractPoolsFromTrees(trees);

    return {
        title: {title, id},
        startTime,
        progress: {state: operationState, ...progress},
        userPool: {user: operationUser, pools},
    };
}

function processOperationsResponse(response: DashboardOperationsResponse[]) {
    const operations = [];

    for (let authorIdx = 0; authorIdx < response.length; authorIdx++) {
        if (!response[authorIdx]?.operations) continue;

        for (const operation of response[authorIdx].operations) {
            operations.push(processOperation(operation));
        }
    }

    return operations;
}

export async function fetchOperations(args: OperationsQueryArgs, api: BaseQueryApi) {
    try {
        const {cluster: _cluster, authorType, state: operationState, authors, pool, limit} = args;
        const state = api.getState() as RootState;
        const user = state.global.login;

        let response: Array<BatchResultsItem<DashboardOperationsResponse>>;

        if (authorType === 'custom') {
            const requests = createCustomAuthorRequests(authors, limit, operationState, pool);
            response = await ytApiV3Id.executeBatch<DashboardOperationsResponse>(
                YTApiId.operationsDashboard,
                {
                    requests,
                },
            );
        } else {
            response = await ytApiV3Id.executeBatch<DashboardOperationsResponse>(
                YTApiId.operationsDashboard,
                {
                    requests: [
                        {
                            command: 'list_operations' as const,
                            parameters: {
                                ...createOperationRequestParameters(limit, operationState, pool),
                                user,
                            },
                        },
                    ],
                },
            );
        }

        const res = map_(response, (item) => item?.output || {operations: []});
        const operations = processOperationsResponse(res);

        return {data: operations};
    } catch (error) {
        return {error};
    }
}
