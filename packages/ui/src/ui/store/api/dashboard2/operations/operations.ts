import {BaseQueryApi} from '@reduxjs/toolkit/query';

import map_ from 'lodash/map';

import {RootState} from '../../../../store/reducers';

import ypath from '../../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

type OperationProgress = {
    completed: number;
    running: number;
    jobs: number;
};

export async function operations(
    args: {
        cluster: string;
        responsibleType: 'me' | 'my-list';
        state?: string;
        responsibles?: Array<{value: string; type: string}>;
    },
    api: BaseQueryApi,
) {
    try {
        const {cluster: _cluster, responsibleType, state: queryState, responsibles} = args;
        const state = api.getState() as RootState;
        const user = state.global.login;

        const requests = map_(responsibles, (item) => ({
            command: 'list_operations' as const,
            parameters: {
                limit: 10,
                state: queryState === 'all' ? undefined : queryState,
                user: item.value,
            },
        }));

        let response;

        if (responsibleType === 'my-list') {
            response = await ytApiV3Id.executeBatch(YTApiId.listDashboardOperations, {
                requests,
            });
            response = map_(response, (item) => item?.output);
        } else {
            response = await ytApiV3Id.listOperations(YTApiId.listDashboardOperations, {
                parameters: {
                    limit: 10,
                    state: queryState === 'all' ? undefined : queryState,
                    user,
                },
            });
        }

        const operations = [];
        for (let responsibleIdx = 0; responsibleIdx < response.length; responsibleIdx++) {
            for (const operation of response[responsibleIdx].operations) {
                const id = ypath.getValue(operation, '/id');
                const title = ypath.getValue(operation, '/brief_spec/title') ?? id;
                const startTime = ypath.getValue(operation, '/start_time');

                const jobs = ypath.getValue(operation, '/brief_progress/jobs');

                const progress = {};
                if (jobs) {
                    const completed =
                        typeof jobs.completed === 'object' ? jobs.completed.total : jobs.completed;

                    progress['completedProgress'] = (completed / (jobs.total || 1)) * 100;
                    progress['runningProgress'] = ((jobs.running || 1) / (jobs.total || 1)) * 100;
                    progress['jobsProgress'] =
                        progress['completedProgress'] + progress['runningProgress'];
                }

                const operationState = ypath.getValue(operation, '/state');
                const user = ypath.getValue(operation, '/authenticated_user');

                const trees = ypath.getValue(
                    operation,
                    '/runtime_parameters/scheduling_options_per_pool_tree',
                );

                const pools = [];

                for (const tree in trees) {
                    if (trees[tree] && trees[tree].pool) {
                        pools.push({tree, pool: trees[tree].pool});
                    }
                }

                operations.push({
                    title: {title, id},
                    startTime,
                    progress: {state: operationState, progress},
                    userPool: {user, pools},
                });
            }
        }

        return {data: operations};
    } catch (error) {
        return {error};
    }
}
