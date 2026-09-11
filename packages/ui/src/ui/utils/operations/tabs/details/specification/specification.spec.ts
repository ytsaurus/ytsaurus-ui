import {DetailedOperationSelector} from '../../../../../pages/operations/selectors';
import {prepareSpecification} from './specification';

describe('prepareSpecification', () => {
    it('uses patched task job count', () => {
        const operation = new DetailedOperationSelector(
            {
                id: '33ab3f-bf1df917-b35fe9ed-c70a4bf4',
                type: 'vanilla',
                state: 'running',
                spec: {
                    tasks: {
                        main: {
                            command: 'sleep inf',
                            job_count: 1,
                        },
                    },
                },
                full_spec: {
                    tasks: {
                        main: {
                            command: 'sleep inf',
                            job_count: 1,
                        },
                    },
                },
                cumulative_spec_patch: {
                    tasks: {
                        main: {
                            job_count: 5,
                        },
                    },
                },
            },
            {},
        );

        const specification = prepareSpecification(operation, false);

        expect(specification.tasks?.[0]?.jobCount).toBe(5);
    });
});
