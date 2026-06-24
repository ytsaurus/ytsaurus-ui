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
import {type FormApi, YTDFDialog} from '../../../../containers/Dialog';
import Icon from '../../../../components/Icon/Icon';
import Link from '../../../../containers/Link/Link';

import {
    closeCreateTableModal,
    createTable,
    setCreateTableGroupSuggestions,
    setCreateTableLockSuggestions,
} from '../../../../store/actions/navigation/modals/create-table';

import {createNewColumn} from '../../../../store/reducers/navigation/modals/create-table';

import {
    ColumnAggregateTypes as AggrTypes,
    type ColumnAggregateType,
    ColumnDataTypes,
    SELECT_EMPTY_VALUE,
} from '../../../../constants/navigation/modals/create-table';
import {
    selectColumnGroupSuggestions,
    selectColumnLockSuggestions,
    selectCreateTableModalState,
} from '../../../../store/selectors/navigation/modals/create-table';
import {StorageOptions} from '../../../../utils/cypress-attributes';

import {type RootState} from '../../../../store/reducers';
import {
    selectCompressionCodecs,
    selectErasureCodecs,
    selectPrimitiveTypes,
} from '../../../../store/selectors/global/supported-features';
import {type SelectWithSubItemsProps} from '../../../../containers/Dialog/controls/SelectWithSubItems/SelectWithSubItems';
import {docsUrl, getNewTableReplicasCount} from '../../../../config';

import './CreateTableModal.scss';
import {ASCENDING, DESCENDING} from './CreateTableTabField/CreateTableTabField';
import {type FIX_MY_TYPE} from '../../../../types';
import UIFactory from '../../../../UIFactory';
import i18n from './i18n';

const block = cn('create-table-modal');

function getNoSuggestionsMsg() {
    return i18n('alert_no-suggestions-yet');
}

export function makeLink(url: string, label = i18n('action_help'), inline = false) {
    const link = (
        <Link target={'_blank'} url={url}>
            {label}
        </Link>
    );
    return inline ? link : <div>{link}</div>;
}

enum TableType {
    QUEUE = 'queue',
    DYNAMIC = 'dynamic',
    STATIC = 'static',
}

const AGGREGATE_CHOICES = [
    {
        value: SELECT_EMPTY_VALUE,
        get text() {
            return i18n('value_default');
        },
    },
].concat(map_(AggrTypes, (i) => ({value: i, text: i})));

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
    tableType: TableType;
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

        const attributes: Record<string, any> = {
            dynamic: tableType === TableType.QUEUE || tableType == TableType.DYNAMIC,
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

    validateColumnDataType(columnData: ColumnData, tableType: TableType) {
        const {dataType, optional} = columnData || {};

        if (dataType === ColumnDataTypes.ANY || dataType === ColumnDataTypes.YSON) {
            if (tableType === TableType.DYNAMIC && this.isOrderedColumn(columnData)) {
                return i18n('alert_key-column-wrong-type', {dataType});
            }
            if (!optional) {
                return i18n('alert_column-must-be-optional', {dataType});
            }
        }

        if (tableType === TableType.QUEUE && this.isSortedColumn(columnData)) {
            return i18n('alert_queue-no-sorted-columns');
        }

        if (tableType === TableType.DYNAMIC && this.isDescendingColumn(columnData)) {
            return i18n('alert_dynamic-tables-no-descending-order');
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
                return i18n('alert_aggregate-invalid-type', {aggr});
            }
        }

        if (aggr === AggrTypes.XDELTA && type !== ColumnDataTypes.STRING) {
            return i18n('alert_aggregate-xdelta-invalid-type', {aggr});
        }
        return undefined;
    }

    validateColumnLock(columnData: ColumnData) {
        const ordered = this.isOrderedColumn(columnData);
        const {lock} = columnData || {};
        if (lock && ordered) {
            return i18n('alert_lock-cannot-be-set-on-key-column');
        }
        return undefined;
    }

    validateColumnData(columnData: ColumnData, tableType: TableType) {
        const res: Record<string, string> = {};
        const aggregate = this.validateAggregate(columnData);
        if (aggregate) {
            res.aggregate = aggregate;
        }
        const dataType = this.validateColumnDataType(columnData, tableType);
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
            return i18n('alert_replicas-count-must-be-integer');
        }
        if (v < 0 || v > 10) {
            return i18n('alert_replicas-count-out-of-range');
        }
        return undefined;
    }

    validateTableName = (value: string) => {
        const {parentDirectory} = this.props;
        if (value === parentDirectory + '/' || value === parentDirectory) {
            return i18n('alert_name-matches-parent-directory');
        }
        return undefined;
    };

    isOrderedColumn(columnData: ColumnData) {
        const {id} = columnData;
        return Boolean(this.props.keyColumns[id]);
    }

    isAscendingColumn(columnData: ColumnData) {
        const {id} = columnData;
        return this.props.keyColumns[id] === ASCENDING;
    }

    isDescendingColumn(columnData: ColumnData) {
        const {id} = columnData;
        return this.props.keyColumns[id] === DESCENDING;
    }

    isSortedColumn(columnData: ColumnData) {
        return this.isAscendingColumn(columnData) || this.isDescendingColumn(columnData);
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
            res.tableType = i18n('alert_dynamic-table-must-have-sorted-and-unsorted');
        }

        if (tableType === TableType.QUEUE && hasOrderedColumn) {
            res.tableType = i18n('alert_queue-no-sorted-columns');
        }

        if (tableType === TableType.DYNAMIC && !res.tableType) {
            const hasDescendingColumns = some_(this.keyColumns, (value) => -1 === value);
            if (hasDescendingColumns) {
                res.tableType = i18n('alert_dynamic-tables-no-descending-columns');
            }
        }

        const replicasCountError = this.validateReplicasCount(replicasCount);
        if (replicasCountError) {
            res.replicasCount = replicasCountError;
        }

        if (uniqueKeys && !hasOrderedColumn) {
            res.uniqueKeys = i18n('alert_unique-keys-needs-sorted-column');
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
            setError(`${COLUMNS}[${index}]`, this.validateColumnData(columnData, tableType));
        });
        forEach_(nameCounters, (indices) => {
            if (indices.length > 1) {
                indices.forEach((index) => {
                    set_(
                        errors,
                        `${COLUMNS}[${index}].name`,
                        i18n('alert_column-name-already-exists'),
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
                pristineSubmittable
                className={block(null, className)}
                size={'l'}
                visible={showModal}
                headerProps={{
                    title: i18n('title_create-table'),
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
                        title: i18n('title_table-settings'),
                        fields: [
                            {
                                name: 'name',
                                type: 'text',
                                caption: i18n('field_table-name'),
                            },
                            {
                                name: 'tableType',
                                type: 'radio',
                                caption: i18n('field_table-type'),
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        {i18n('context_data-rows-of')}
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls['storage:static_tables'],
                                                i18n('value_static-tables-link'),
                                                true,
                                            ),
                                            i18n('value_static-tables-link'),
                                        )}
                                        {i18n('context_static-tables-description')}
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls['dynamic-tables:overview'],
                                                i18n('value_dynamic-tables-link'),
                                                true,
                                            ),
                                            i18n('value_dynamic-tables-link'),
                                        )}
                                        {i18n('context_dynamic-tables-allow-modify')}
                                        <div className={block('alert-text')}>
                                            {i18n('context_before-using-dynamic-tables')}{' '}
                                            <b>{i18n('context_heavy-load-or-strict-sla')} </b>
                                            {i18n('context_consult-with-dev-team')}
                                        </div>
                                    </div>
                                ),
                                extras: {
                                    options: [
                                        {
                                            value: TableType.STATIC,
                                            label: i18n('value_static-table'),
                                        },
                                        {
                                            value: TableType.DYNAMIC,
                                            label: i18n('value_dynamic-table'),
                                        },
                                        {
                                            value: TableType.QUEUE,
                                            label: i18n('value_queue-table'),
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
                                caption: i18n('field_optimize-for'),
                                tooltip: docsUrl(
                                    makeLink(UIFactory.docsUrls['storage:chunks#optimize_for']),
                                ),
                                extras: {
                                    options: [
                                        {value: 'scan', label: i18n('value_scan')},
                                        {value: 'lookup', label: i18n('value_lookup')},
                                    ],
                                },
                            },
                            {
                                name: 'compressionCodec',
                                type: 'select-with-subitems',
                                caption: i18n('field_compression'),
                                tooltip: docsUrl(
                                    makeLink(
                                        UIFactory.docsUrls[
                                            'storage:compression#compression_codecs'
                                        ],
                                    ),
                                ),
                                extras: {
                                    ...compressionCodecs,
                                    disablePortal: false,
                                },
                            },
                            {
                                name: 'storageOption',
                                type: 'radio',
                                caption: i18n('field_storage-options'),
                                tooltip: docsUrl(
                                    makeLink(UIFactory.docsUrls['storage:replication#replication']),
                                ),
                                extras: {
                                    options: [
                                        {
                                            value: StorageOptions.REPLICATION,
                                            label: i18n('value_replication'),
                                        },
                                        {
                                            value: StorageOptions.ERASURE,
                                            label: i18n('value_erasure-encoding'),
                                        },
                                    ],
                                },
                            },
                            {
                                name: 'replicasCount',
                                type: 'text',
                                caption: i18n('field_number-of-replicas'),
                                visibilityCondition: {
                                    when: `${TABLE_SETTINGS}.storageOption`,
                                    isActive: (value: string) =>
                                        value === StorageOptions.REPLICATION,
                                },
                            },
                            {
                                name: 'erasureCodec',
                                type: 'yt-select-single',
                                caption: i18n('field_erasure-codec'),
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        {i18n('context_erasure-encoding-description')}
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
                                        <span className={block('title')}>
                                            {i18n('title_schema-settings')}
                                        </span>
                                    ),
                                },
                            },
                            ...deactivateFieldByVisibilityCondition({
                                name: 'uniqueKeys',
                                type: 'tumbler' as const,
                                caption: i18n('field_unique-keys'),
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        {i18n('context_unique-keys-description')}
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
                                    <Icon awesome={'trash-alt'} /> {i18n('action_delete-column')}
                                </Button>
                            );
                        },
                        fields: [
                            {
                                name: 'name',
                                type: 'text',
                                caption: i18n('field_column-name'),
                                required: true,
                            },
                            {
                                name: 'dataType',
                                type: 'yt-select-single',
                                caption: i18n('field_data-type'),
                                tooltip: docsUrl(
                                    makeLink(UIFactory.docsUrls['storage:data_types#schema']),
                                ),
                                extras: {
                                    items: primitiveTypes,
                                    placeholder: i18n('action_select-type'),
                                    width: 'max',
                                    hideClear: true,
                                },
                                touched: true, // required to display errors even if the field is not touched
                            },
                            {
                                name: 'optional',
                                type: 'tumbler',
                                caption: i18n('field_optional'),
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        {i18n('context_optional-description')}
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
                                caption: i18n('field_column-group-name'),
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        {i18n('context_same-group-same-block')}
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
                                // TODO: fix this, so the definition of onChange didnt change, but the compiler throw errors
                                // @ts-ignore
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
                                caption: i18n('field_lock'),
                                tooltip: (
                                    <div className={block('tooltip')}>
                                        {i18n('context_lock-description')}
                                        {docsUrl(
                                            makeLink(
                                                UIFactory.docsUrls[
                                                    'dynamic-tables:transactions#conflicts'
                                                ],
                                            ),
                                        )}
                                    </div>
                                ),
                                // TODO: fix this, so the definition of onChange didnt change, but the compiler throw errors
                                // @ts-ignore
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
                                caption: i18n('field_aggregate'),
                                tooltip: docsUrl(
                                    makeLink(
                                        UIFactory.docsUrls[
                                            'dynamic-tables:sorted_dynamic_tables#aggr_columns'
                                        ],
                                    ),
                                ),
                                extras: {
                                    items: AGGREGATE_CHOICES,
                                    placeholder: i18n('action_select-aggregation'),
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
        selectCreateTableModalState(state);

    const primitiveTypes = selectPrimitiveTypes(state);

    return {
        showModal,
        parentDirectory,
        groupSuggestions: selectColumnGroupSuggestions(state),
        lockSuggestions: selectColumnLockSuggestions(state),
        columnNameCounters,

        keyColumns,
        columnsOrder,

        compressionCodecs: selectCompressionCodecs(state),
        erasureCodecs: selectErasureCodecs(state),
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
