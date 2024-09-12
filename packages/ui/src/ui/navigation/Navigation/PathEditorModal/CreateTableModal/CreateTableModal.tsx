import React from 'react';
import cn from 'bem-cn-lite';
import {connect} from 'react-redux';

import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';
import some_ from 'lodash/some';
import sortBy_ from 'lodash/sortBy';
import set_ from 'lodash/set';

import Button from '../../../../components/Button/Button';
import {FormApi, YTDFDialog} from '../../../../components/Dialog';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../components/Link/Link';

import {
    closeCreateTableModal,
    createTable,
    setCreateTableGroupSuggestions,
    setCreateTableLockSuggestions,
} from '../../../../store/actions/navigation/modals/create-table';

import {createNewColumn} from '../../../../store/reducers/navigation/modals/create-table';

import {
    ColumnAggregateTypes as AggrTypes,
    ColumnAggregateType,
    ColumnDataTypes,
    SELECT_EMPTY_VALUE,
} from '../../../../constants/navigation/modals/create-table';
import {
    getColumnGroupSuggestions,
    getColumnLockSuggestions,
    getCreateTableModalState,
} from '../../../../store/selectors/navigation/modals/create-table';
import {StorageOptions} from '../../../../utils/cypress-attributes';

import {RootState} from '../../../../store/reducers';
import {
    getCompressionCodecs,
    getErasureCodecs,
    getPrimitiveTypes,
} from '../../../../store/selectors/global/supported-features';
import {SelectWithSubItemsProps} from '../../../../components/Dialog/controls/SelectWithSubItems/SelectWithSubItems';
import {docsUrl, getNewTableReplicasCount} from '../../../../config';

import './CreateTableModal.scss';
import {DESCENDING} from './CreateTableTabField/CreateTableTabField';
import {FIX_MY_TYPE} from '../../../../types';
import UIFactory from '../../../../UIFactory';

const block = cn('create-table-modal');

function getNoSuggestionsMsg() {
    return 'There is no any suggestions yet';
}

export function makeLink(url: string, label = 'Help', inline = false) {
    const link = (
        <Link target={'_blank'} url={url}>
            {label}
        </Link>
    );
    return inline ? link : <div>{link}</div>;
}

const TableType = {
    DYNAMIC: 'dynamic',
    STATIC: 'static',
};

const AGGREGATE_CHOICES = [{value: SELECT_EMPTY_VALUE, text: 'default'}].concat(
    map_(AggrTypes, (i) => ({value: i, text: i})),
);

interface WithVisibilityCondition {
    visibilityCondition: {
        when: string;
        isActive: (v: any) => boolean;
    };
    extras?: {
        disable?: boolean;
    };
}

function deactivateFieldByVisibilityCondition<T extends WithVisibilityCondition>(
    field: T,
): Array<T> {
    const {
        visibilityCondition: {when, isActive},
        ...rest
    } = field;
    return [
        {
            ...rest,
            visibilityCondition: {
                when,
                isActive,
            },
        } as any,
        {
            ...rest,
            visibilityCondition: {
                when,
                isActive: (v: any) => !isActive(v),
            },
            extras: {
                disabled: true,
            },
        } as any,
    ];
}

const TABLE_SETTINGS = 'tableSettings';
const COLUMNS = 'columns';

interface Props {
    className?: string;
    showModal: boolean;

    parentDirectory?: string;

    closeCreateTableModal: () => void;
    lockSuggestions: Array<string>;
    groupSuggestions: Array<string>;
    sortedColumnsCount: number;
    columnNameCounters: Record<number, number>;

    modifyColumn: () => void;
    removeColumn: () => void;
    setColumnSort: () => void;
    createTable: (path: string, settings: unknown) => Promise<void>;
    setColumnName: () => void;

    setCreateTableGroupSuggestions: (items: Array<string>) => void;
    setCreateTableLockSuggestions: (items: Array<string>) => void;

    columnsOrder: Record<number, ColumnData>;

    keyColumns: Record<string, -1 | 1>;

    compressionCodecs: Pick<SelectWithSubItemsProps, 'items' | 'subItemsMap'>;
    erasureCodecs: Array<{value: string; text: string}>;
    primitiveTypes: Array<{value: string; text: string}>;
}

interface ColumnData {
    id: string;
    name: string;
    nameError?: string;
    dataType?: string;
    aggregate?: ColumnAggregateType | typeof SELECT_EMPTY_VALUE;
    optional?: boolean;
    ascending?: 1 | -1;
    lock?: string;
    group?: string;
    type?: string;
    sort_order?: string;
}

interface TableSettingsTab {
    uniqueKeys: boolean;
    name: string;
    replicasCount: string;
    tableType: 'static' | 'dynamic';
}

function genNewName(items: Array<{name: string}>, name: string) {
    const names = new Set(map_(items, 'name'));
    if (!names.has(name)) {
        return name;
    }

    for (let i = 0; i < items.length; ++i) {
        const tmp = `${name}_${i + 1}`;
        if (!names.has(tmp)) {
            return tmp;
        }
    }

    return name;
}

class CreateTableModalContentImpl extends React.Component<Props> {
    nextId = 2;

    tableType = TableType.STATIC;
    tableName = undefined;
    replicasCount = getNewTableReplicasCount();
    uniqueKeys = false;
    activeTabId = TABLE_SETTINGS;

    private columns: Array<ColumnData> = [];

    // eslint-disable-next-line react/sort-comp
    createNewColumn = (selectedColumnTab?: ColumnData, options: {userOptions?: any} = {}) => {
        const {duplicate} = options?.userOptions || {};

        const {primitiveTypes} = this.props;
        const newTab = createNewColumn(this.nextId++, primitiveTypes[0]?.value);

        if (!duplicate || !selectedColumnTab) {
            return newTab;
        } else {
            const name = genNewName(this.columns, selectedColumnTab.name + '_copy');
            return {
                ...newTab,
                ...selectedColumnTab,
                name,
                id: newTab.id,
            };
        }
    };

    reorderColumns(columns: Array<ColumnData>) {
        const {columnsOrder} = this.props;
        const indexById = reduce_(
            columnsOrder,
            (acc, item, index) => {
                acc[item.id] = index as any;
                return acc;
            },
            {} as Record<string, number>,
        );
        return sortBy_(columns, (item) => indexById[item.id]);
    }

    onAdd = (form: FormApi<FIX_MY_TYPE>): Promise<void> => {
        const {values} = form.getState();
        const {
            [TABLE_SETTINGS]: {
                name: path,
                tableType,
                compressionCodec: compCodec,
                storageOption,
                replicasCount,
                erasureCodec,
                uniqueKeys,
                optimize_for,
            },
            [COLUMNS]: columnsRaw,
        } = values;
        const columns = this.reorderColumns(columnsRaw);

        const isDynamic = tableType === TableType.DYNAMIC;
        const attributes: Record<string, any> = {
            dynamic: isDynamic,
            optimize_for,
        };

        if (!isEqual_(compCodec, [SELECT_EMPTY_VALUE])) {
            attributes.compression_codec = compCodec.join('');
        }

        if (storageOption === StorageOptions.REPLICATION) {
            attributes.replication_factor = Number(replicasCount);
        } else {
            attributes.erasure_codec = erasureCodec;
        }

        const schemaAttributes: Record<string, any> = {};
        if (uniqueKeys || tableType === TableType.DYNAMIC) {
            schemaAttributes.unique_keys = true;
        }

        const {keyColumns} = this.props;
        const schemaColumns = map_(columns, (item) => {
            const {aggregate, dataType: type, group, id, name, optional, lock} = item;
            const ascending = keyColumns[id];

            const res: {
                name?: string;
                type_v3?: string;
                group?: string;
                lock?: string;
                aggregate?: ColumnAggregateType;
                optional?: boolean;
                sort_order?: string;
            } = {
                name,
                type_v3: type,
            };

            if (group) {
                res.group = group;
            }

            if (lock) {
                res.lock = lock;
            }

            if (aggregate !== SELECT_EMPTY_VALUE) {
                res.aggregate = aggregate;
            }

            if (ascending) {
                res.sort_order = ascending === 1 ? 'ascending' : 'descending';
            }
            return {
                ...res,
                type_v3: !optional ? res.type_v3 : {type_name: 'optional', item: res.type_v3},
            };
        });

        return this.props.createTable(path, {
            ...attributes,
            schema: {
                $attributes: schemaAttributes,
                $value: schemaColumns,
            },
        });
    };

    validateColumnDataType(columnData: ColumnData, isDynamicTable: boolean) {
        const {dataType, optional} = columnData || {};

        if (dataType === ColumnDataTypes.ANY || dataType === ColumnDataTypes.YSON) {
            if (isDynamicTable && this.isOrderedColumn(columnData)) {
                return `Key-column should not be of type [${dataType}]`;
            }
            if (!optional) {
                return `Column with type [${dataType}] should be optional.`;
            }
        }

        if (isDynamicTable && this.isDescendingColumn(columnData)) {
            return "Dynamic tables do not support 'Descending' order";
        }

        return undefined;
    }

    validateAggregate(columnData: ColumnData) {
        const {dataType: type, aggregate: aggr} = columnData || {};
        if (aggr === AggrTypes.SUM || aggr === AggrTypes.MIN || aggr === AggrTypes.MAX) {
            if (
                type !== ColumnDataTypes.INT64 &&
                type !== ColumnDataTypes.UINT64 &&
                type !== ColumnDataTypes.DOUBLE
            ) {
                return `[${aggr}] aggregate might be only applied to a column of type int64/uint64/double`;
            }
        }
        return undefined;
    }

    validateColumnLock(columnData: ColumnData) {
        const ordered = this.isOrderedColumn(columnData);
        const {lock} = columnData || {};
        if (lock && ordered) {
            return 'Lock cannot be set on a key-column';
        }
        return undefined;
    }

    validateColumnData(columnData: ColumnData, isDynamicTable: boolean) {
        const res: Record<string, string> = {};
        const aggregate = this.validateAggregate(columnData);
        if (aggregate) {
            res.aggregate = aggregate;
        }
        const dataType = this.validateColumnDataType(columnData, isDynamicTable);
        if (dataType) {
            res.dataType = dataType;
        }
        const lock = this.validateColumnLock(columnData);
        if (lock) {
            res.lock = lock;
        }
        return isEmpty_(res) ? undefined : res;
    }

    validateReplicasCount(str: string) {
        const v = Number(str);
        // @ts-ignore
        if (str != v || v !== Math.round(v)) {
            return 'The value must be defined as a valid integer number';
        }
        if (v < 0 || v > 10) {
            return 'The value must be in range [0; 10]';
        }
        return undefined;
    }

    validateTableName = (value: string) => {
        const {parentDirectory} = this.props;
        if (value === parentDirectory + '/' || value === parentDirectory) {
            return 'The name must not match to parent directory name';
        }
        return undefined;
    };

    isOrderedColumn(columnData: ColumnData) {
        const {id} = columnData;
        return Boolean(this.props.keyColumns[id]);
    }

    isDescendingColumn(columnData: ColumnData) {
        const {id} = columnData;
        return this.props.keyColumns[id] === DESCENDING;
    }

    validateTableSettings(tableSettings: TableSettingsTab, columns: Array<ColumnData>) {
        const res: Partial<Record<keyof TableSettingsTab, string>> = {};
        const hasOrderedColumn = some_(columns, (colData) => this.isOrderedColumn(colData));
        const hasUnorderedColumn = some_(columns, (colData) => !this.isOrderedColumn(colData));

        const {uniqueKeys, name, replicasCount, tableType} = tableSettings;

        const nameError = this.validateTableName(name);
        if (nameError) {
            res.name = nameError;
        }

        if (tableType === TableType.DYNAMIC && (!hasOrderedColumn || !hasUnorderedColumn)) {
            res.tableType =
                'Any dynamic table must have at least one sorted column and one unsorted column';
        }

        if (tableType === TableType.DYNAMIC && !res.tableType) {
            const hasDescendingColumns = some_(this.keyColumns, (value) => -1 === value);
            if (hasDescendingColumns) {
                res.tableType = 'Dynamic tables do not support descending-sorted columns';
            }
        }

        const replicasCountError = this.validateReplicasCount(replicasCount);
        if (replicasCountError) {
            res.replicasCount = replicasCountError;
        }

        if (uniqueKeys && !hasOrderedColumn) {
            res.uniqueKeys = 'The table must contain at least one sorted column.';
        }

        return isEmpty_(res) ? null : res;
    }

    onClose = () => {
        this.nextId = 2;
        return this.props.closeCreateTableModal();
    };

    // eslint-disable-next-line @typescript-eslint/member-ordering
    lastValidationResult: object | null = null;

    validateForm = (values: any) => {
        const errors = {};

        const tableSettings = values[TABLE_SETTINGS];

        const setError = (path: string, error: any) => {
            if (error) {
                set_(errors, path, error);
            }
        };

        const {tableType} = tableSettings;

        const columns: Array<ColumnData> = values[COLUMNS];
        this.columns = columns;
        const nameCounters: Record<string, Array<number>> = {};
        forEach_(columns, (columnData, index) => {
            const {name} = columnData;
            const nameIndexes = nameCounters[name];
            if (!nameIndexes) {
                nameCounters[name] = [index];
            } else {
                nameIndexes.push(index);
            }

            // Validate column
            setError(
                `${COLUMNS}[${index}]`,
                this.validateColumnData(columnData, tableType === TableType.DYNAMIC),
            );
        });
        forEach_(nameCounters, (indices) => {
            if (indices.length > 1) {
                indices.forEach((index) => {
                    set_(
                        errors,
                        `${COLUMNS}[${index}].name`,
                        'The column with this name already exists',
                    );
                });
            }
        });

        // validate tableSettings
        setError(TABLE_SETTINGS, this.validateTableSettings(tableSettings, columns));

        this.lastValidationResult = errors;
        return errors;
    };

    // eslint-disable-next-line @typescript-eslint/member-ordering
    keyColumns: Props['keyColumns'] = {};
    // eslint-disable-next-line @typescript-eslint/member-ordering
    formValidator = this.validateForm.bind(this);
    getFormValidator() {
        const {keyColumns} = this.props;
        if (this.keyColumns !== keyColumns) {
            this.keyColumns = keyColumns;
            /*
             * keyColumns is modified externally and Dialog knows nothing about it
             * and we need to create new instance of Function to force call its
             * validation with new keyColumns.
             * Without creation of new function validation will not be called
             */
            this.formValidator = this.validateForm.bind(this);
        }
        return this.formValidator;
    }

    render() {
        const {
            className,
            parentDirectory,
            showModal,
            compressionCodecs,
            erasureCodecs,
            primitiveTypes,
            groupSuggestions,
        } = this.props;
        const name = `${parentDirectory}/new_table`;

        return (
            <YTDFDialog<FIX_MY_TYPE>
                virtualized
                pristineSubmittable
                className={block(null, className)}
                size={'l'}
                visible={showModal}
                headerProps={{
                    title: 'Create Table',
                }}
                isApplyDisabled={() => {
                    return !isEmpty_(this.lastValidationResult);
                }}
                validate={this.getFormValidator()}
                onActiveTabChange={(tab) => {
                    this.activeTabId = tab;
                }}
                onAdd={this.onAdd}
                onClose={this.onClose}
                initialValues={{
                    [TABLE_SETTINGS]: {
                        name: this.tableName !== undefined ? this.tableName : name,
                        tableType: this.tableType,
                        compressionCodec: [SELECT_EMPTY_VALUE],
                        storageOption: StorageOptions.REPLICATION,
                        replicasCount: this.replicasCount,
                        erasureCodec: 'lrc_12_2_2',
                        uniqueKeys: this.uniqueKeys,
                        optimize_for: 'lookup',
                    },
                    [COLUMNS]: [createNewColumn(1, primitiveTypes[0]?.value)],
                }}
                fields={[
                    {
                        name: TABLE_SETTINGS,
                        type: 'yt-create-table-tab',
                        title: 'Table settings',
                        fields: [
                            {
                                name: 'name',
                                type: 'text',
                                caption: 'Table name',
                            },
                            {
                                name: 'tableType',
                                type: 'radio',
                                caption: 'Table type',
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        Data rows of
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls['storage:static_tables'],
                                                ' Static tables ',
                                                true,
                                            ),
                                            ' Static tables ',
                                        )}
                                        nearly impossible to modify, but they might be removed or
                                        merged, also new data rows might be appended to the end of a
                                        table. As the opposite of the above described restrictions
                                        there are
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls['dynamic-tables:overview'],
                                                ' Dynamic tables ',
                                                true,
                                            ),
                                            ' Dynamic tables ',
                                        )}
                                        which allow to modify data rows by key.
                                        <div className={block('alert-text')}>
                                            Before using Dynamic tables in production environment
                                            with <b>heavy load or strict SLA </b>
                                            you have to consult with development team.
                                        </div>
                                    </div>
                                ),
                                extras: {
                                    options: [
                                        {
                                            value: TableType.STATIC,
                                            label: 'Static',
                                        },
                                        {
                                            value: TableType.DYNAMIC,
                                            label: 'Dynamic',
                                        },
                                    ],
                                },
                            },
                            {
                                separator: true,
                            },
                            {
                                name: 'optimize_for',
                                type: 'radio',
                                caption: 'Optimize for',
                                tooltip: docsUrl(
                                    makeLink(UIFactory.docsUrls['storage:chunks#optimize_for']),
                                ),
                                extras: {
                                    options: [
                                        {value: 'scan', label: 'Scan'},
                                        {value: 'lookup', label: 'Lookup'},
                                    ],
                                },
                            },
                            {
                                name: 'compressionCodec',
                                type: 'select-with-subitems',
                                caption: 'Compression',
                                tooltip: docsUrl(
                                    makeLink(
                                        UIFactory.docsUrls[
                                            'storage:compression#compression_codecs'
                                        ],
                                    ),
                                ),
                                extras: {
                                    ...compressionCodecs,
                                },
                            },
                            {
                                name: 'storageOption',
                                type: 'radio',
                                caption: 'Storage options',
                                tooltip: docsUrl(
                                    makeLink(UIFactory.docsUrls['storage:replication#replication']),
                                ),
                                extras: {
                                    options: [
                                        {
                                            value: StorageOptions.REPLICATION,
                                            label: 'Replication',
                                        },
                                        {
                                            value: StorageOptions.ERASURE,
                                            label: 'Erasure encoding',
                                        },
                                    ],
                                },
                            },
                            {
                                name: 'replicasCount',
                                type: 'text',
                                caption: 'Number of replicas',
                                visibilityCondition: {
                                    when: `${TABLE_SETTINGS}.storageOption`,
                                    isActive: (value: string) =>
                                        value === StorageOptions.REPLICATION,
                                },
                            },
                            {
                                name: 'erasureCodec',
                                type: 'yt-select-single',
                                caption: 'Erasure codec',
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        Erasure encoding allows to minimize disk space allocated for
                                        the table comparing with Replication, but it requires more
                                        CPU time during data access.
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls['storage:replication#erasure'],
                                            ),
                                        )}
                                    </div>
                                ),
                                visibilityCondition: {
                                    when: `${TABLE_SETTINGS}.storageOption`,
                                    isActive: (value: string) => value === StorageOptions.ERASURE,
                                },
                                extras: {
                                    items: erasureCodecs,
                                    hideFilter: true,
                                    width: 'max',
                                },
                            },
                            {
                                separator: true,
                            },
                            {
                                type: 'block',
                                name: 'schemaSettings',
                                extras: {
                                    children: (
                                        <span className={block('title')}>Schema settings</span>
                                    ),
                                },
                            },
                            ...deactivateFieldByVisibilityCondition({
                                name: 'uniqueKeys',
                                type: 'tumbler' as const,
                                caption: 'Unique keys',
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        The parameter is actual only for static tables, for all
                                        dynamic tables it is always automatically enabled regardless
                                        of its value.
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls[
                                                    'storage:static_schema#overview'
                                                ],
                                            ),
                                        )}
                                    </div>
                                ),
                                visibilityCondition: {
                                    when: `${TABLE_SETTINGS}.tableType`,
                                    isActive: (value) => value === TableType.STATIC,
                                },
                            }),
                        ],
                    },
                    {
                        name: COLUMNS,
                        type: 'yt-create-table-tab',
                        multiple: true,
                        onCreateTab: this.createNewColumn,
                        getTitle: (values) => values.name,
                        isRemovable: () => false,
                        renderControls: (_item, _onCreate, onRemove) => {
                            return (
                                <Button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        onRemove?.();
                                        e.stopPropagation();
                                    }}
                                >
                                    <Icon awesome={'trash-alt'} /> Delete column
                                </Button>
                            );
                        },
                        fields: [
                            {
                                name: 'name',
                                type: 'text',
                                caption: 'Column name',
                                required: true,
                            },
                            {
                                name: 'dataType',
                                type: 'yt-select-single',
                                caption: 'Data type',
                                tooltip: docsUrl(
                                    makeLink(UIFactory.docsUrls['storage:data_types#schema']),
                                ),
                                extras: {
                                    items: primitiveTypes,
                                    placeholder: 'Select type',
                                    width: 'max',
                                    hideClear: true,
                                },
                                touched: true, // required to display errors even if the field is not touched
                            },
                            {
                                name: 'optional',
                                type: 'tumbler',
                                caption: 'Optional',
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        If the parameter is enabled the value might be defined as
                                        null. For dynamic tables all key-columns are required
                                        regardless of this value.
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls[
                                                    'storage:data_types#schema_optional'
                                                ],
                                            ),
                                        )}
                                    </div>
                                ),
                            },
                            {
                                name: 'group',
                                type: 'create-table-group-suggest',
                                caption: 'Column group name',
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        When columns have the same group name then the data of such
                                        columns will be placed in the same blocks.
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls[
                                                    'storage:static_schema#overview'
                                                ],
                                            ),
                                        )}
                                    </div>
                                ),
                                extras: {
                                    getItems: () => groupSuggestions,
                                    ...{
                                        getNoItemsMessage: getNoSuggestionsMsg,
                                    },
                                },
                                onChange: (
                                    _value: unknown,
                                    _oldValue: unknown,
                                    _field: unknown,
                                    _fieldName: unknown,
                                    _form: unknown,
                                    {values}: ReturnType<FormApi<FIX_MY_TYPE>['getState']>,
                                ) => {
                                    const allGroups = map_(values?.columns, 'group').filter((v) =>
                                        Boolean(v),
                                    );
                                    this.props.setCreateTableGroupSuggestions(allGroups);
                                },
                            },
                            {
                                separator: true,
                            },
                            {
                                name: 'lock',
                                type: 'create-table-lock-suggest',
                                caption: 'Lock',
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        By default locking is applied to all columns of row. This
                                        parameter allows to improve granularity of locking by
                                        defining groups of columns to lock.
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls[
                                                    'dynamic-tables:transactions#conflicts'
                                                ],
                                            ),
                                        )}
                                    </div>
                                ),
                                onChange: (
                                    _value: unknown,
                                    _oldValue: unknown,
                                    _field: unknown,
                                    _fieldName: unknown,
                                    _form: unknown,
                                    {values}: ReturnType<FormApi<FIX_MY_TYPE>['getState']>,
                                ) => {
                                    const allLocks = map_(values?.columns, 'lock').filter((v) =>
                                        Boolean(v),
                                    );
                                    this.props.setCreateTableLockSuggestions(allLocks);
                                },
                            },
                            {
                                name: 'aggregate',
                                type: 'yt-select-single',
                                caption: 'Aggregate',
                                tooltip: docsUrl(
                                    makeLink(
                                        UIFactory.docsUrls[
                                            'dynamic-tables:sorted_dynamic_tables#aggr_columns'
                                        ],
                                    ),
                                ),
                                extras: {
                                    items: AGGREGATE_CHOICES,
                                    placeholder: 'Select aggregation',
                                    width: 'max',
                                    hideFilter: true,
                                },
                            },
                        ],
                    },
                ]}
            />
        );
    }
}

const mapStateToProps = (state: RootState) => {
    const {showModal, parentDirectory, columnNameCounters, keyColumns, columnsOrder} =
        getCreateTableModalState(state);

    const primitiveTypes = getPrimitiveTypes(state);

    return {
        showModal,
        parentDirectory,
        groupSuggestions: getColumnGroupSuggestions(state),
        lockSuggestions: getColumnLockSuggestions(state),
        columnNameCounters,

        keyColumns,
        columnsOrder,

        compressionCodecs: getCompressionCodecs(state),
        erasureCodecs: getErasureCodecs(state),
        primitiveTypes,
    };
};

const mapDispatchToProps = {
    closeCreateTableModal,
    createTable,
    setCreateTableLockSuggestions,
    setCreateTableGroupSuggestions,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateTableModalContentImpl);
