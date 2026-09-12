import {
    applyOperationSpecPatch,
    extractKnownOperationSpecPatchValues,
    getTaskJobCountPath,
    mergeKnownOperationSpecPatchValues,
    operationSpecPatchToItems,
} from './specification-patch';

describe('applyOperationSpecPatch', () => {
    it('applies root and nested patches without mutating inputs', () => {
        const fullSpec = {
            max_failed_job_count: 1,
            tasks: {
                worker: {job_count: 2, command: 'sleep 100'},
            },
        };
        const patch = {
            max_failed_job_count: 10,
            tasks: {
                worker: {job_count: 5},
            },
        };

        expect(applyOperationSpecPatch(fullSpec, patch)).toEqual({
            max_failed_job_count: 10,
            tasks: {
                worker: {job_count: 5, command: 'sleep 100'},
            },
        });
        expect(fullSpec).toEqual({
            max_failed_job_count: 1,
            tasks: {
                worker: {job_count: 2, command: 'sleep 100'},
            },
        });
        expect(patch).toEqual({
            max_failed_job_count: 10,
            tasks: {
                worker: {job_count: 5},
            },
        });
    });

    it('preserves typed YSON nodes', () => {
        const fullSpec = {
            max_failed_job_count: {$type: 'int64', $value: '1'},
            tasks: {
                $type: 'map',
                $value: {
                    worker: {
                        $type: 'map',
                        $value: {
                            job_count: {$type: 'int64', $value: '2'},
                        },
                    },
                },
            },
        };
        const patch = {
            $type: 'map',
            $value: {
                max_failed_job_count: {$type: 'int64', $value: '10'},
                tasks: {
                    $type: 'map',
                    $value: {
                        worker: {
                            $type: 'map',
                            $value: {
                                job_count: {$type: 'int64', $value: '5'},
                            },
                        },
                    },
                },
            },
        };

        expect(applyOperationSpecPatch(fullSpec, patch)).toEqual({
            max_failed_job_count: {$type: 'int64', $value: '10'},
            tasks: {
                $type: 'map',
                $value: {
                    worker: {
                        $type: 'map',
                        $value: {
                            job_count: {$type: 'int64', $value: '5'},
                        },
                    },
                },
            },
        });
    });

    it('replaces arrays and typed scalar nodes instead of merging them', () => {
        const fullSpec = {
            values: [1, 2, 3],
            option: {$type: 'int64', $value: '1'},
        };
        const patch = {
            values: [4],
            option: {$type: 'entity'},
        };

        expect(applyOperationSpecPatch(fullSpec, patch)).toEqual({
            values: [4],
            option: {$type: 'entity'},
        });
    });

    it('returns the original spec when the patch is empty', () => {
        const fullSpec = {max_failed_job_count: 1};

        expect(applyOperationSpecPatch(fullSpec, {})).toBe(fullSpec);
        expect(applyOperationSpecPatch(fullSpec)).toBe(fullSpec);
    });
});

describe('operationSpecPatchToItems', () => {
    it('converts a patch dictionary to API items without filtering paths or values', () => {
        const patch = {
            '/max_failed_job_count': 10,
            '/some/new/path': {arbitrary: 'value'},
        };

        expect(operationSpecPatchToItems(patch)).toEqual([
            {path: '/max_failed_job_count', value: 10},
            {path: '/some/new/path', value: {arbitrary: 'value'}},
        ]);
    });
});

describe('known operation specification patch values', () => {
    const taskNames = ['main', 'task/with special@characters'];

    it('extracts known numeric values and preserves zero', () => {
        expect(
            extractKnownOperationSpecPatchValues(
                {
                    '/max_failed_job_count': 0,
                    '/tasks/main/job_count': 5,
                    '/tasks/task\\/with special\\@characters/job_count': 'invalid',
                },
                taskNames,
            ),
        ).toEqual({
            maxFailedJobCount: 0,
            taskJobCounts: {
                main: 5,
                'task/with special@characters': undefined,
            },
        });
    });

    it('merges form values without mutating the patch or dropping unknown paths', () => {
        const patch = {
            '/max_failed_job_count': 10,
            '/tasks/main/job_count': 3,
            '/some/future/path': {value: true},
        };

        expect(
            mergeKnownOperationSpecPatchValues(
                patch,
                {
                    maxFailedJobCount: 20,
                    taskJobCounts: {
                        main: undefined,
                        'task/with special@characters': 0,
                    },
                },
                taskNames,
            ),
        ).toEqual({
            '/max_failed_job_count': 20,
            '/tasks/task\\/with special\\@characters/job_count': 0,
            '/some/future/path': {value: true},
        });
        expect(patch).toEqual({
            '/max_failed_job_count': 10,
            '/tasks/main/job_count': 3,
            '/some/future/path': {value: true},
        });
    });

    it('keeps known values that cannot be represented by number fields', () => {
        const patch = {
            '/max_failed_job_count': 'invalid',
            '/tasks/main/job_count': null,
        };

        expect(
            mergeKnownOperationSpecPatchValues(patch, {taskJobCounts: {main: undefined}}, ['main']),
        ).toEqual(patch);
    });

    it('escapes task names for YPath', () => {
        expect(getTaskJobCountPath('task/with special@characters')).toBe(
            '/tasks/task\\/with special\\@characters/job_count',
        );
    });
});
