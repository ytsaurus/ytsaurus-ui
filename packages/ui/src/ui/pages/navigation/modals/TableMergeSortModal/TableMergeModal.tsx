import React from 'react';

import map_ from 'lodash/map';
import pickBy_ from 'lodash/pickBy';

import {DialogError, FormApi, YTDFDialog} from '../../../../components/Dialog';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    getNavigationTableAttributesValues,
    getNavigationTableMergeVisible,
    getNavigationTableSortError,
    getNavigationTableSortPaths,
    getNavigationTableSortSuggestColumns,
} from '../../../../store/selectors/navigation/modals/table-merge-sort-modal';
import {
    hideTableMergeModal,
    isPathStaticTable,
    runTableMerge,
    tableSortModalLoadColumns,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {getCurrentUserName} from '../../../../store/selectors/global';
import {makeLink} from '../CreateTableModal/CreateTableModal';
import {parseBytes} from '../../../../utils/parse/parse-bytes';
import {docsUrl} from '../../../../config';
import UIFactory from '../../../../UIFactory';
import {WaitForDefaultPoolTree} from '../../../../hooks/global-pool-trees';

export default function TableMergeModal() {
    const login = useSelector(getCurrentUserName);
    const visible = useSelector(getNavigationTableMergeVisible);
    const paths = useSelector(getNavigationTableSortPaths);
    const suggestError = useSelector(getNavigationTableSortError);
    const suggestColumns = useSelector(getNavigationTableSortSuggestColumns);
    const attributeValues = useSelector(getNavigationTableAttributesValues);

    const [error, setError] = React.useState<any>();

    const dispatch = useDispatch();

    const handleAdd = React.useCallback(
        async (form: FormApi<FormValues>) => {
            try {
                const {values} = form.getState();
                const {
                    mode,
                    paths,
                    outputPath,
                    columns,
                    pool,
                    poolTree,
                    chunkSize,
                    force_transform,
                    combine_chunks,
                } = values;
                const chunkSizeBytes = parseBytes(chunkSize);
                const data_size_per_job = isNaN(chunkSizeBytes) ? undefined : chunkSizeBytes;
                const pool_trees = poolTree.length ? poolTree : undefined;
                await dispatch(
                    runTableMerge(
                        pickBy_(
                            {
                                mode,
                                input_table_paths: paths,
                                output_table_path: {
                                    $value: outputPath,
                                    $attributes: attributeValues,
                                },
                                merge_by: map_(columns, 'name'),
                                pool,
                                pool_trees,
                                data_size_per_job,
                                force_transform,
                                combine_chunks,
                            },
                            Boolean,
                        ) as any,
                    ),
                );
            } catch (e) {
                setError(e);
                throw e;
            }
        },
        [attributeValues, dispatch],
    );

    const handleClose = React.useCallback(() => {
        dispatch(hideTableMergeModal());
    }, [dispatch]);

    const handlePathsChange = React.useCallback(
        (paths: Array<string>) => {
            dispatch(tableSortModalLoadColumns(paths));
        },
        [dispatch],
    );

    const outputPath = paths?.length === 1 ? paths[0] : undefined;

    return (
        <WaitForDefaultPoolTree>
            {({defaultPoolTree}) => (
                <YTDFDialog<FormValues>
                    visible={visible}
                    headerProps={{
                        title: 'Merge',
                    }}
                    pristineSubmittable={true}
                    onAdd={handleAdd}
                    onClose={handleClose}
                    initialValues={{
                        paths,
                        mode: 'unordered',
                        outputPath,
                        columns: [],
                        force_transform: true,
                        poolTree: [defaultPoolTree],
                        combine_chunks: true,
                    }}
                    fields={[
                        {
                            name: 'mode',
                            type: 'radio',
                            caption: 'Mode',
                            tooltip: docsUrl(makeLink(UIFactory.docsUrls['operations:merge'])),
                            extras: {
                                options: [
                                    {value: 'unordered', label: 'Unordered'},
                                    {value: 'sorted', label: 'Sorted'},
                                    {value: 'ordered', label: 'Ordered'},
                                ],
                            },
                        },
                        {
                            name: 'paths',
                            type: 'editable-path-list',
                            caption: 'Input paths',
                            required: true,
                            onChange: handlePathsChange,
                            extras: {
                                placeholder: 'Enter a path to add',
                            },
                        },
                        {
                            name: 'outputPath',
                            type: 'output-path',
                            caption: 'Output path',
                            required: true,
                            validator: isPathStaticTable,
                            touched: true,
                            extras: {
                                placeholder: 'Enter path for output',
                            },
                            tooltip: (
                                <span>
                                    If the path is not an exist then started operation will be
                                    failed
                                </span>
                            ),
                        },
                        {
                            name: 'columns',
                            type: 'table-sort-by',
                            caption: 'Merge by columns',
                            extras: {
                                suggestColumns,
                            },
                        },
                        {
                            name: 'chunkSize',
                            type: 'table-chunk-size',
                            caption: 'Chunk size',
                        },
                        {
                            name: 'combine_chunks',
                            type: 'tumbler',
                            caption: 'Combine chunks',
                        },
                        {
                            name: 'poolTree',
                            type: 'pool-tree',
                            caption: 'Pool tree',
                            extras: {
                                multiple: true,
                            },
                        },
                        {
                            name: 'pool',
                            type: 'pool',
                            caption: 'Pool',
                            tooltip: docsUrl(
                                makeLink(
                                    UIFactory.docsUrls[
                                        'operations:operations_options#obshie-opcii-dlya-vseh-tipov-operacij'
                                    ],
                                ),
                            ),
                            extras: ({poolTree}: FormValues) => {
                                return {
                                    poolTrees: poolTree,
                                    placeholder: login,
                                    allowEphemeral: true,
                                };
                            },
                        },
                        {
                            name: 'force_transform',
                            type: 'tumbler',
                            caption: 'Force transform',
                        },
                        ...(!error
                            ? []
                            : [
                                  {
                                      name: 'error',
                                      type: 'block' as const,
                                      extras: {
                                          children: <DialogError error={error} />,
                                      },
                                  },
                              ]),
                        ...(!suggestError
                            ? []
                            : [
                                  {
                                      name: 'suggestError',
                                      type: 'block' as const,
                                      extras: {
                                          children: <DialogError error={suggestError} />,
                                      },
                                  },
                              ]),
                    ]}
                />
            )}
        </WaitForDefaultPoolTree>
    );
}

interface FormValues {
    mode: string;
    pool: string;
    poolTree: string[];

    paths: Array<string>;
    outputPath: string;
    columns: Array<unknown>;
    chunkSize: string;
    force_transform: boolean;
    combine_chunks: boolean;
}
