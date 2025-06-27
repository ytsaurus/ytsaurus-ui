import {BaseQueryApi} from '@reduxjs/toolkit/query';

import map_ from 'lodash/map';
import forEach_ from 'lodash/forEach';

import {RootState} from '../../../../store/reducers';

import ypath from '../../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {NavigationFlowState, StatusLabelState} from '../../../../types/common/states';
import {ListOperationsParams} from '../../../../../shared/yt-types';

export type OperationProgressInfo = {
    completed: number;
    running: number;
    jobs: number;
    state?: StatusLabelState | NavigationFlowState;
};

type OperationsQueryArgs = {
    id: string;
    cluster: string;
    authorType: 'me' | 'my-list';
    state?: string;
    authors?: Array<{value: string; type: string}>;
    pool?: string;
    limit?: number;
};

export async function fetchOperations(args: OperationsQueryArgs, api: BaseQueryApi) {
    try {
        const {cluster: _cluster, authorType, state: operationState, authors, pool, limit} = args;
        const state = api.getState() as RootState;
        const user = state.global.login;

        let response;

        if (authorType === 'my-list') {
            let requests = map_(authors, (item) => ({
                command: 'list_operations' as const,
                parameters: {
                    limit: limit ?? 10,
                    state: operationState === 'all' ? undefined : operationState,
                    user: item.value,
                    pool: pool?.length ? pool : undefined,
                } as ListOperationsParams,
            }));

            if (pool?.length && !authors?.length) {
                requests = [
                    {
                        command: 'list_operations' as const,
                        parameters: {
                            limit: limit ?? 10,
                            state: operationState === 'all' ? undefined : operationState,
                            pool,
                        },
                    },
                ];
            }

            response = await ytApiV3Id.executeBatch(YTApiId.operationsDashboard, {
                requests,
            });
            response = map_(response, (item) => item?.output);
        } else {
            response = await ytApiV3Id.listOperations(YTApiId.operationsDashboard, {
                parameters: {
                    limit: limit ?? 10,
                    state: operationState === 'all' ? undefined : operationState,
                    user,
                    pool: pool?.length ? pool : undefined,
                },
            });
        }

        const operations = [];

        for (let authorIdx = 0; authorIdx < response.length; authorIdx++) {
            if (!response[authorIdx]?.operations) continue;

            for (const operation of response[authorIdx].operations) {
                const id: string = ypath.getValue(operation, '/id') ?? 'unknown';
                const title: string = ypath.getValue(operation, '/brief_spec/title') ?? id;
                const startTime = ypath.getValue(operation, '/start_time');

                const jobs = ypath.getValue(operation, '/brief_progress/jobs');

                const progress: OperationProgressInfo = {
                    completed: 0,
                    running: 0,
                    jobs: 0,
                };

                if (jobs) {
                    const completed =
                        typeof jobs.completed === 'object' ? jobs.completed.total : jobs.completed;

                    progress['completed'] = (completed / (jobs.total || 1)) * 100;
                    progress['running'] = ((jobs.running || 1) / (jobs.total || 1)) * 100;
                    progress['jobs'] = progress['completed'] + progress['running'];
                }

                const operationState: StatusLabelState | NavigationFlowState | undefined =
                    ypath.getValue(operation, '/state');
                const user: string = ypath.getValue(operation, '/authenticated_user');

                const trees: Record<string, {pool?: string} & unknown> = ypath.getValue(
                    operation,
                    '/runtime_parameters/scheduling_options_per_pool_tree',
                );

                const pools: {tree: string; pool: string[]}[] = [];

                forEach_(Object.values(trees), (tree, idx) => {
                    if (Object.keys(trees)?.[idx] && tree?.pool) {
                        pools.push({tree: Object.keys(trees)[idx], pool: [tree.pool]});
                    }
                });

                operations.push({
                    title: {title, id},
                    startTime,
                    progress: {state: operationState, ...progress},
                    userPool: {user, pools},
                });
            }
        }

        return {data: operations};
    } catch (error) {
        return {error};
    }
}
