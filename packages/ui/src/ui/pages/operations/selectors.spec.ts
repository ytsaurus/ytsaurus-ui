import {DetailedOperationSelector} from './selectors';

function makeOperation(maxFailedJobCount: number, patchedMaxFailedJobCount?: number) {
    const cumulativeSpecPatch =
        patchedMaxFailedJobCount === undefined
            ? undefined
            : {max_failed_job_count: patchedMaxFailedJobCount};

    return new DetailedOperationSelector(
        {
            id: '33ab3f-bf1df917-b35fe9ed-c70a4bf4',
            full_spec: {max_failed_job_count: maxFailedJobCount},
            cumulative_spec_patch: cumulativeSpecPatch,
            progress: {
                jobs: {completed: 0, running: 1, total: 1, failed: 5},
            },
        },
        {},
    );
}

describe('DetailedOperationSelector specification patch', () => {
    it('uses max_failed_job_count from the resulting spec', () => {
        const operation = makeOperation(1, 10);

        expect(operation.resultingSpec).toEqual({max_failed_job_count: 10});
        expect(operation.totalFailedJobs).toBe(10);
        expect(operation.failedJobsProgress).toBe(50);
    });

    it('falls back to max_failed_job_count from full_spec', () => {
        const operation = makeOperation(10);

        expect(operation.resultingSpec).toEqual({max_failed_job_count: 10});
        expect(operation.totalFailedJobs).toBe(10);
    });

    it('preserves zero max_failed_job_count', () => {
        const operation = makeOperation(10, 0);

        expect(operation.resultingSpec).toEqual({max_failed_job_count: 0});
        expect(operation.totalFailedJobs).toBe(0);
        expect(operation.failedJobsProgress).toBe(0);
    });

    it('builds a typed resulting spec from typed YSON attributes', () => {
        const operation = new DetailedOperationSelector(
            {
                full_spec: {max_failed_job_count: 1},
                cumulative_spec_patch: {max_failed_job_count: 10},
            },
            {
                full_spec: {
                    $type: 'map',
                    $value: {max_failed_job_count: {$type: 'int64', $value: '1'}},
                },
                cumulative_spec_patch: {
                    $type: 'map',
                    $value: {max_failed_job_count: {$type: 'int64', $value: '10'}},
                },
            },
        );

        expect(operation.typedResultingSpec).toEqual({
            max_failed_job_count: {$type: 'int64', $value: '10'},
        });
    });
});
