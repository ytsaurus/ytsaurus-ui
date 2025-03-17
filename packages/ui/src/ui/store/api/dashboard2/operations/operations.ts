import ypath from '../../../../common/thor/ypath';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';

type OperationProgress = {
    completed: number;
    running: number;
    jobs: number;
};

export async function operations(args: {cluster: string; state?: string}) {
    try {
        const {cluster: _cluster, state} = args;
        const response = await ytApiV3Id.listOperations(YTApiId.listOperations, {
            parameters: {
                limit: 10,
                state: state === 'all' ? undefined : state,
            },
        });

        const operations = [];
        for (const operation of response.operations) {
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
        return {data: operations};
    } catch (error) {
        return {error};
    }
}
