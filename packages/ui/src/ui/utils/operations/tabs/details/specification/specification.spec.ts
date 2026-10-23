import {DetailedOperationSelector} from '../../../../../pages/operations/selectors';
import {prepareSpecification} from './specification';

describe('prepareSpecification', () => {
    it('uses parsed input paths and typed filters from the resulting spec', () => {
        const path = '//tmp/input';
        const ranges = [{lower_limit: {row_index: 0}, upper_limit: {row_index: 100}}];
        const typedRanges = [
            {
                lower_limit: {row_index: {$type: 'int64', $value: '0'}},
                upper_limit: {row_index: {$type: 'int64', $value: '100'}},
            },
        ];
        const spec = {
            input_table_paths: [
                `<cluster=hahn;ranges=[{lower_limit={row_index=0};upper_limit={row_index=100}}]>${path}`,
            ],
        };
        const table = {$value: path, $attributes: {cluster: 'hahn', ranges}};
        const operation = new DetailedOperationSelector(
            {
                type: 'map',
                state: 'completed',
                spec,
                full_spec: {input_table_paths: [table]},
            },
            {
                spec,
                full_spec: {
                    input_table_paths: [
                        {...table, $attributes: {...table.$attributes, ranges: typedRanges}},
                    ],
                },
            },
        );

        expect(prepareSpecification(operation, false).input).toMatchObject([
            {path: '//tmp', cluster: 'hahn', isFolder: true},
            {
                path,
                cluster: 'hahn',
                name: 'input',
                filters: {ranges},
                typedFilters: {ranges: typedRanges},
            },
        ]);
    });

    it('uses input paths from the original spec while the resulting spec is absent', () => {
        const spec = {input_table_paths: ['//tmp/input']};
        const operation = new DetailedOperationSelector(
            {type: 'map', state: 'initializing', spec},
            {spec},
        );

        expect(prepareSpecification(operation, false).input).toMatchObject([
            {path: '//tmp', isFolder: true},
            {path: '//tmp/input', name: 'input'},
        ]);
    });

    it('keeps unparseable paths between grouped tables', () => {
        const path = '<ranges=[{lower_limit={row_index=0}}]>//tmp/input';
        const spec = {input_table_paths: ['//tmp/first', path, '//tmp/last']};
        const operation = new DetailedOperationSelector(
            {type: 'map', state: 'initializing', spec},
            {spec},
        );
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        try {
            const {input} = prepareSpecification(operation, false);

            expect(input).toMatchObject([
                {path: '//tmp', isFolder: true},
                {path: '//tmp/first', name: 'first'},
                {path},
                {path: '//tmp', isFolder: true},
                {path: '//tmp/last', name: 'last'},
            ]);
            expect(input[2].isFolder).toBeUndefined();
            expect(input[2].name).toBeUndefined();
        } finally {
            errorSpy.mockRestore();
        }
    });

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
