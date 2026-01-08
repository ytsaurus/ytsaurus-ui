import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {DialogError, DialogField, YTDFDialog} from '../../../../components/Dialog';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    getNavigationTableAttributesValues,
    getNavigationTableSortError,
    getNavigationTableSortPaths,
    getNavigationTableSortSuggestColumns,
    getNavigationTableSortVisible,
} from '../../../../store/selectors/navigation/modals/table-merge-sort-modal';
import {
    hideTableSortModal,
    isPathStaticTable,
    runTableSort,
    tableSortModalLoadColumns,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {getCurrentUserName} from '../../../../store/selectors/global';
import {makeLink} from '../CreateTableModal/CreateTableModal';
import './TableSortModal.scss';
import {ColumnSortByInfo} from './TableSortByControl';
import {docsUrl} from '../../../../config';
import UIFactory from '../../../../UIFactory';
import {WaitForDefaultPoolTree} from '../../../../hooks/global-pool-trees';

const block = cn('table-sort-modal');

export default function TableSortModal() {
    const login = useSelector(getCurrentUserName);
    const visible = useSelector(getNavigationTableSortVisible);
    const paths = useSelector(getNavigationTableSortPaths);
    const suggestError = useSelector(getNavigationTableSortError);
    const suggestColumns = useSelector(getNavigationTableSortSuggestColumns);
    const attributeValues = useSelector(getNavigationTableAttributesValues);

    const [error, setError] = React.useState<any>();

    const dispatch = useDispatch();

    const handleAdd = React.useCallback(
        async (form: any) => {
            try {
                const {values} = form.getState();
                const {paths, outputPath, columns, pool, poolTree} = values;

                const spec = Object.assign(
                    {
                        input_table_paths: paths,
                        output_table_path: {
                            $value: outputPath,
                            $attributes: attributeValues,
                        },
                        sort_by: map_(columns, (item: ColumnSortByInfo) => {
                            return {
                                name: item.name,
                                sort_order: item.descending
                                    ? ('descending' as const)
                                    : ('ascending' as const),
                            };
                        }),
                    },
                    pool ? {pool} : {},
                    poolTree.length ? {pool_trees: poolTree} : {},
                );

                await dispatch(runTableSort(spec));
                return;
            } catch (e) {
                setError(e);
                throw e;
            }
        },
        [attributeValues, dispatch],
    );

    const handleClose = React.useCallback(() => {
        dispatch(hideTableSortModal());
    }, [dispatch]);

    const handlePathsChange = React.useCallback(
        (paths: Array<string>) => {
            dispatch(tableSortModalLoadColumns(paths));
        },
        [dispatch],
    );

    const title = paths?.length > 1 ? 'Sort tables' : 'Sort table';
    const outputPath = paths?.length === 1 ? paths[0] : undefined;

    const errorFields: Array<DialogField<FormValues>> = [];
    if (error) {
        errorFields.push({
            name: 'error',
            type: 'block',
            extras: {
                children: <DialogError error={error} />,
            },
        });
    }
    if (suggestError) {
        errorFields.push({
            name: 'error',
            type: 'block',
            extras: {
                children: <DialogError error={suggestError} />,
            },
        });
    }

    return !visible ? null : (
        <WaitForDefaultPoolTree>
            {({defaultPoolTree}) => (
                <YTDFDialog<FormValues>
                    className={block()}
                    visible={visible}
                    headerProps={{
                        title,
                    }}
                    onAdd={handleAdd}
                    onClose={handleClose}
                    initialValues={{
                        paths,
                        outputPath,
                        columns: [],
                        poolTree: [defaultPoolTree],
                    }}
                    fields={[
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
                            extras: {
                                placeholder: 'Enter path for output',
                            },
                            tooltip: (
                                <span>
                                    If the path is not exists then started operation will be failed
                                </span>
                            ),
                        },
                        {
                            name: 'columns',
                            type: 'table-sort-by',
                            caption: 'Sort by columns',
                            required: true,
                            extras: {
                                suggestColumns,
                                allowDescending: true,
                            },
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
                            extras: (values: FormValues) => {
                                const {poolTree} = values;
                                return {
                                    placeholder: login,
                                    poolTrees: poolTree,
                                    allowEphemeral: true,
                                };
                            },
                        },
                        ...errorFields,
                    ]}
                />
            )}
        </WaitForDefaultPoolTree>
    );
}

interface FormValues {
    paths: Array<string>;
    outputPath: string;
    columns: Array<string>;
    poolTree: string[];
    pool: string;
}
