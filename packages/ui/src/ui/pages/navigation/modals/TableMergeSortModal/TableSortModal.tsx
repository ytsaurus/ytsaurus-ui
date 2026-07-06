import React from 'react';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';

import {DialogError, type DialogField, YTDFDialog} from '../../../../containers/Dialog';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectNavigationTableAttributesValues,
    selectNavigationTableSortError,
    selectNavigationTableSortPaths,
    selectNavigationTableSortSuggestColumns,
    selectNavigationTableSortVisible,
} from '../../../../store/selectors/navigation/modals/table-merge-sort-modal';
import {
    DYNAMIC_TABLE_WRITER_SETTINGS,
    hideTableSortModal,
    isPathStaticTable,
    runTableSort,
    tableSortModalLoadColumns,
} from '../../../../store/actions/navigation/modals/table-merge-sort-modal';
import {selectCurrentUserName} from '../../../../store/selectors/global';
import {makeLink} from '../CreateTableModal/CreateTableModal';
import './TableSortModal.scss';
import {type ColumnSortByInfo} from './TableSortByControl';
import {docsUrl} from '../../../../config';
import UIFactory from '../../../../UIFactory';
import {WaitForDefaultPoolTree} from '../../../../hooks/global-pool-trees';
import {getAlterOutputToDynamicFields} from '../fields/alter-output-to-dynamic/alter-output-to-dynamic';
import i18n from './i18n';

const block = cn('table-sort-modal');

export default function TableSortModal() {
    const login = useSelector(selectCurrentUserName);
    const visible = useSelector(selectNavigationTableSortVisible);
    const paths = useSelector(selectNavigationTableSortPaths);
    const suggestError = useSelector(selectNavigationTableSortError);
    const suggestColumns = useSelector(selectNavigationTableSortSuggestColumns);
    const attributeValues = useSelector(selectNavigationTableAttributesValues);

    const [error, setError] = React.useState<any>();

    const dispatch = useDispatch();

    const handleAdd = React.useCallback(
        async (form: any) => {
            try {
                const {values} = form.getState();
                const {paths, outputPath, columns, pool, poolTree, alterOutputToDynamic} = values;

                const dynamicSettings = alterOutputToDynamic
                    ? {table_writer: DYNAMIC_TABLE_WRITER_SETTINGS}
                    : undefined;

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
                    dynamicSettings ? {sort_job_io: dynamicSettings} : {},
                    dynamicSettings ? {auto_merge: {job_io: dynamicSettings}} : {},
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

    const title = paths?.length > 1 ? i18n('title_sort-tables') : i18n('title_sort-table');
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
                            caption: i18n('field_input-paths'),
                            required: true,
                            onChange: handlePathsChange,
                            extras: {
                                placeholder: i18n('context_enter-path-to-add'),
                            },
                        },
                        {
                            name: 'outputPath',
                            type: 'output-path',
                            caption: i18n('field_output-path'),
                            required: true,
                            validator: isPathStaticTable,
                            extras: {
                                placeholder: i18n('context_enter-path-for-output'),
                            },
                            tooltip: <span>{i18n('context_output-path-not-exists')}</span>,
                        },
                        {
                            name: 'columns',
                            type: 'table-sort-by',
                            caption: i18n('field_sort-by-columns'),
                            required: true,
                            extras: {
                                suggestColumns,
                                allowDescending: true,
                            },
                        },
                        {
                            name: 'poolTree',
                            type: 'pool-tree',
                            caption: i18n('field_pool-tree'),
                            extras: {
                                multiple: true,
                            },
                        },
                        {
                            name: 'pool',
                            type: 'pool',
                            caption: i18n('field_pool'),
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
                        ...getAlterOutputToDynamicFields<FormValues>(),
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
    alterOutputToDynamic: boolean;
}
