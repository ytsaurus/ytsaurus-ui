import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import moment from 'moment';

import compact_ from 'lodash/compact';

import {DropdownMenu, Flex, Progress, Text} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import ColumnHeader, {
    ColumnHeaderProps,
} from '../../../../../../components/ColumnHeader/ColumnHeader';
import {
    DataTableGravity,
    TableCell,
    useTable,
    tanstack,
    TableSettings,
} from '../../../../../../components/DataTableGravity';
import {
    FormatNumber,
    FormatNumberProps,
} from '../../../../../../components/FormatNumber/FormatNumber';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import {OperationType} from '../../../../../../components/OperationType/OperationType';
import {SubjectCard} from '../../../../../../components/SubjectLink/SubjectLink';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import {getSchedulingOperationsLoading} from '../../../../../../store/selectors/scheduling/expanded-pools';
import Label from '../../../../../../components/Label/Label';
import {
    getSchedulingContentMode,
    getSchedulingOverviewTableItems,
    getSchedulingSortState,
} from '../../../../../../store/selectors/scheduling/scheduling';
import {getPoolPathsByName} from '../../../../../../store/actions/scheduling/expanded-pools';
import {openAttributesModal} from '../../../../../../store/actions/modals/attributes-modal';
import {useThunkDispatch} from '../../../../../../store/thunkDispatch';

import {NameCell} from './NameCell';
import PoolTags from './PoolTags';
import i18n from './i18n';
import './SchedulingTable.scss';
import {getSchedulingOverivewColumns} from '../../../../../../store/selectors/scheduling/overview-columns';
import {childTableItems, SchedulingColumn} from '../../../../../../utils/scheduling/detailsTable';
import {KeysByType} from '../../../../../../../@types/types';
import {
    openEditModal,
    schedulingSetSortState,
} from '../../../../../../store/actions/scheduling/scheduling';
import {openPoolDeleteModal} from '../../../../../../store/actions/scheduling/scheduling-ts';
import {getProgressTheme} from '../../../../../../utils/progress';
import ShareUsageBar from '../../../../../../pages/scheduling/Content/controls/ShareUsageBar';
import {useSettingsColumnSizes} from '../../../../../../hooks/settings/use-settings-column-sizes';
import {useSettingsVisibleColumns} from '../../../../../../hooks/settings/use-settings-column-visibility';

const block = cn('yt-scheduling-table');

export type RowData = ReturnType<typeof getSchedulingOverviewTableItems>[number];

export function SchedulingTable() {
    const {columnSizes, setColumnSizes} = useSettingsColumnSizes(
        'global::scheduling::overviewColumnSizes',
    );

    const {onColumnVisibilityChange, onColumnOrderChange} = useSettingsVisibleColumns(
        'global::scheduling::overviewColumns',
    );

    const {columns, columnVisibility, columnOrder} = useSchedulingTableColumns();
    const items = useSelector(getSchedulingOverviewTableItems);

    const table = useTable({
        columns,
        data: items,
        enableColumnPinning: true,
        enableColumnResizing: true,
        state: {
            columnPinning: {
                left: ['name'],
                right: ['actions'],
            },
            columnSizing: columnSizes,
            columnVisibility,
            columnOrder,
        },
        onColumnSizingChange: setColumnSizes,
        onColumnVisibilityChange,
        onColumnOrderChange,
    });

    return <DataTableGravity table={table} virtualized rowHeight={49} />;
}

type SchedulintTableMode = ReturnType<typeof getSchedulingContentMode>;

const COLUMNS_BY_MODE: Record<SchedulintTableMode, Array<SchedulingColumn>> = {
    summary: [
        'weight',
        'type',
        'user',
        'dominant_resource',
        'fair_share_usage',
        'usage',
        'demand',
        'guaranteed',
        'operation_overview',
        'duration',
    ],
    cpu: [
        'FI',
        'weight',
        'min_resources_cpu',
        'abs_guaranteed_cpu',
        'abs_demand_cpu',
        'resource_detailed_cpu',
        'abs_usage_cpu',
        'resource_limit_cpu',
    ],
    memory: [
        'FI',
        'weight',
        'min_resources_memory',
        'abs_guaranteed_memory',
        'abs_demand_memory',
        'resource_detailed_memory',
        'abs_usage_memory',
        'resource_limit_memory',
    ],

    gpu: [
        'FI',
        'weight',
        'min_resources_gpu',
        'abs_guaranteed_gpu',
        'abs_demand_gpu',
        'resource_detailed_gpu',
        'abs_usage_gpu',
        'resource_limit_gpu',
    ],

    user_slots: [
        'FI',
        'weight',
        'min_resources_user_slots',
        'abs_guaranteed_user_slots',
        'abs_demand_user_slots',
        'resource_detailed_user_slots',
        'abs_usage_user_slots',
        'resource_limit_user_slots',
    ],

    operations: [
        'FI',
        'running_operation_count',
        'max_running_operation_count',
        'running_operation_progress',
        'operation_count',
        'max_operation_count',
        'operation_progress',
    ],

    integral_guarantees: [
        'FI',
        'integral_type',
        'burst_cpu',
        'children_burst_cpu',
        'flow_cpu',
        'children_flow_cpu',
        'accumulated',
        'burst_duration',
    ],
    custom: [],
};

function useSchedulingVisibleColumns() {
    const mode = useSelector(getSchedulingContentMode);
    const customColumns = useSelector(getSchedulingOverivewColumns);

    return mode === 'custom' ? customColumns : (COLUMNS_BY_MODE[mode] ?? []);
}

type KeyByGetterReturnType<T> =
    | KeysByType<typeof childTableItems, {sort: (...args: any) => T}>
    | KeysByType<typeof childTableItems, {get: (...args: any) => T}>;

function makeNumberColumn(
    id: KeyByGetterReturnType<number | undefined>,
    type: 'NumberSmart' | 'Bytes' = 'NumberSmart',
) {
    const info = childTableItems[id];
    const {caption} = {caption: undefined, ...info};
    return {
        id,
        header: () => <SchedulingColumnHeader column={id} title={caption} />,
        cell: ({row: {original: item}}: tanstack.CellContext<RowData, unknown>) => {
            let value: number | undefined;
            if ('sort' in info && 'function' === typeof info.sort) {
                value = info.sort(item);
            } else if ('get' in info && 'function' === typeof info.get) {
                value = info.get(item);
            }

            return (
                <TableCell>
                    <FormatNumber value={value} type={type} />
                </TableCell>
            );
        },
    };
}

function makeReadableFieldColumn(id: KeyByGetterReturnType<string | undefined>) {
    const info = childTableItems[id];
    const {caption} = {caption: undefined, ...info};
    return {
        id,
        header: () => <SchedulingColumnHeader column={id} title={caption} />,
        cell: ({row: {original: item}}: tanstack.CellContext<RowData, unknown>) => {
            let value: string | undefined;
            if ('sort' in info && 'function' === typeof info.sort) {
                value = info.sort(item);
            } else if ('get' in info && 'function' === typeof info.get) {
                value = info.get(item);
            }

            return (
                <TableCell>
                    {value === undefined ? format.NO_VALUE : format.ReadableField(value)}
                </TableCell>
            );
        },
    };
}

type SchedulingColumnDef = Omit<tanstack.ColumnDef<RowData>, 'id'> & {id: SchedulingColumn};

function useSchedulingTableColumns() {
    const visibleColumns = useSchedulingVisibleColumns();

    const columns = React.useMemo(() => {
        const availableColumns: Array<SchedulingColumnDef> = [
            {
                id: 'name',
                header: () => <NameHeader />,
                size: 400,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <NameCell row={item} />
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
            },
            {
                id: 'weight',
                header: () => <SchedulingColumnHeader column={'weight'} allowUnordered />,
                cell: ({row: {original: item}}) => {
                    const {weightEdited = NaN, type, weight} = item;
                    return (
                        <TableCell>
                            {type === 'pool' ? (
                                <EditedNumber
                                    value={weight}
                                    edited={weightEdited}
                                    type="NumberSmart"
                                />
                            ) : (
                                <FormatNumber value={weight} type="NumberSmart" />
                            )}
                        </TableCell>
                    );
                },
            },
            {
                id: 'type',
                header: () => <SchedulingColumnHeader column={'type'} allowUnordered />,
                cell: ({row: {original: item}}) => {
                    const {type} = item;
                    return (
                        <TableCell>
                            {type === 'pool' ? (
                                <PoolTags pool={item} />
                            ) : (
                                <OperationType value={item.operationType} />
                            )}
                        </TableCell>
                    );
                },
            },
            {
                id: 'user',
                header: () => <SchedulingColumnHeader column="user" title="Owner" allowUnordered />,
                cell: ({row: {original: item}}) => {
                    const {user} = item;
                    return (
                        <TableCell>
                            {user ? <SubjectCard name={user} type="user" /> : format.NO_VALUE}
                        </TableCell>
                    );
                },
            },
            makeReadableFieldColumn('dominant_resource'),
            {
                id: 'fair_share_usage',
                header: () => (
                    <SchedulingColumnHeader
                        column="fair_share_usage"
                        title="Usage / Fair share"
                        allowUnordered
                    />
                ),
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell justifyContent="center">
                            <FairShareUsage item={item} />
                        </TableCell>
                    );
                },
            },
            {
                id: 'usage',
                header: () => (
                    <SchedulingColumnHeader
                        column="abs_usage_cpu"
                        title="Usage"
                        options={[
                            {column: 'abs_usage_cpu' as const, title: 'CPU', allowUnordered: true},
                            {column: 'abs_usage_gpu' as const, title: 'GPU', allowUnordered: true},
                            {
                                column: 'abs_usage_memory' as const,
                                title: 'RAM',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    const {} = item;
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="usage" />
                        </TableCell>
                    );
                },
            },
            {
                id: 'demand',
                header: () => (
                    <SchedulingColumnHeader
                        column="abs_demand_cpu"
                        title="Demand"
                        options={[
                            {column: 'abs_demand_cpu' as const, title: 'CPU', allowUnordered: true},
                            {column: 'abs_demand_gpu' as const, title: 'GPU', allowUnordered: true},
                            {
                                column: 'abs_demand_memory' as const,
                                title: 'RAM',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    const {} = item;
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="demand" />
                        </TableCell>
                    );
                },
            },
            {
                id: 'guaranteed',
                header: () => (
                    <SchedulingColumnHeader
                        column="abs_guaranteed_cpu"
                        title="Guarantee"
                        options={[
                            {
                                column: 'abs_guaranteed_cpu' as const,
                                title: 'CPU',
                                allowUnordered: true,
                            },
                            {
                                column: 'abs_guaranteed_gpu' as const,
                                title: 'GPU',
                                allowUnordered: true,
                            },
                            {
                                column: 'abs_guaranteed_memory' as const,
                                title: 'RAM',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="guaranteed" />
                        </TableCell>
                    );
                },
            },
            {
                id: 'operation_overview',
                header: () => (
                    <SchedulingColumnHeader
                        column="running_operation_count"
                        title="Operations"
                        options={[
                            {
                                column: 'running_operation_count' as const,
                                title: 'Running',
                                allowUnordered: true,
                            },
                            {
                                column: 'max_operation_count' as const,
                                title: 'Max count',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    const {maxOperationCount, maxOperationCountEdited, runningOperationCount} =
                        item;
                    return (
                        <TableCell>
                            <Text variant="inherit" ellipsis>
                                <FormatNumber value={runningOperationCount} type="NumberSmart" />
                                &nbsp;/&nbsp;
                                <EditedNumber
                                    value={maxOperationCount}
                                    edited={maxOperationCountEdited}
                                    type="NumberSmart"
                                />
                            </Text>
                        </TableCell>
                    );
                },
            },
            {
                id: 'duration',
                header: () => <SchedulingColumnHeader column="duration" />,
                cell: ({row: {original: item}}) => {
                    const {startTime} = item;
                    return (
                        <TableCell>
                            <Duration start={startTime} />
                        </TableCell>
                    );
                },
            },
            {
                id: 'FI',
                header: () => <SchedulingColumnHeader column="FI" />,
                cell: ({row: {original: item}}) => {
                    if (item.fifoIndex === undefined || item.type !== 'operation') {
                        return '';
                    } else {
                        return item.fifoIndex;
                    }
                },
            },
            {
                id: 'operation_progress',
                header: () => (
                    <SchedulingColumnHeader
                        column="operation_count"
                        title={childTableItems.operation_progress.caption}
                        options={[
                            {column: 'operation_progress', title: 'Progress', allowUnordered: true},
                            {column: 'operation_count', title: 'Count', allowUnordered: true},
                            {
                                column: 'max_operation_count',
                                title: 'Max count',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    const info = childTableItems.operation_progress;
                    const value = info.get(item);
                    const theme = getProgressTheme(value);
                    const text = info.text(item);
                    return isNaN(value) ? (
                        format.NO_VALUE
                    ) : (
                        <Progress value={value * 100} theme={theme} text={text} />
                    );
                },
            },
            {
                id: 'running_operation_progress',
                header: () => (
                    <SchedulingColumnHeader
                        column="running_operation_progress"
                        title={childTableItems.running_operation_progress.caption}
                        options={[
                            {
                                column: 'running_operation_progress',
                                title: 'Progress',
                                allowUnordered: true,
                            },
                            {
                                column: 'running_operation_count',
                                title: 'Count',
                                allowUnordered: true,
                            },
                            {
                                column: 'max_running_operation_count',
                                title: 'Max running',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    const info = childTableItems.running_operation_progress;
                    const value = info.get(item);
                    const theme = getProgressTheme(value);
                    const text = info.text(item);
                    return isNaN(value) ? (
                        format.NO_VALUE
                    ) : (
                        <Progress value={value * 100} theme={theme} text={text} />
                    );
                },
            },
            makeNumberColumn('abs_demand_cpu'),
            makeNumberColumn('abs_demand_gpu'),
            makeNumberColumn('abs_demand_memory', 'Bytes'),
            makeNumberColumn('abs_demand_user_slots'),
            makeNumberColumn('abs_guaranteed_cpu'),
            makeNumberColumn('abs_guaranteed_gpu'),
            makeNumberColumn('abs_guaranteed_memory', 'Bytes'),
            makeNumberColumn('abs_guaranteed_user_slots'),
            makeNumberColumn('abs_usage_cpu'),
            makeNumberColumn('abs_usage_gpu'),
            makeNumberColumn('abs_usage_memory', 'Bytes'),
            makeNumberColumn('abs_usage_user_slots'),
            makeNumberColumn('accumulated'),
            makeNumberColumn('burst_cpu'),
            makeNumberColumn('burst_duration'),
            makeNumberColumn('children_burst_cpu'),
            makeNumberColumn('children_flow_cpu'),
            makeNumberColumn('flow_cpu'),
            makeReadableFieldColumn('integral_type'),
            makeNumberColumn('max_operation_count'),
            makeNumberColumn('max_running_operation_count'),
            makeNumberColumn('min_resources_cpu'),
            makeNumberColumn('min_resources_gpu'),
            makeNumberColumn('min_resources_memory', 'Bytes'),
            makeNumberColumn('min_resources_user_slots'),
            makeNumberColumn('operation_count'),
            makeNumberColumn('resource_detailed_cpu'),
            makeNumberColumn('resource_detailed_gpu'),
            makeNumberColumn('resource_detailed_memory', 'Bytes'),
            makeNumberColumn('resource_detailed_user_slots'),
            makeNumberColumn('resource_limit_cpu'),
            makeNumberColumn('resource_limit_gpu'),
            makeNumberColumn('resource_limit_memory', 'Bytes'),
            makeNumberColumn('resource_limit_user_slots'),
            makeNumberColumn('running_operation_count'),
            {
                id: 'actions',
                header: (ctx) => {
                    return <SchedulingTableSettings table={ctx.table} />;
                },
                size: 50,
                cell: ({row: {original: item}}) => {
                    return <RowActions item={item} />;
                },
                enableColumnFilter: false,
                enableHiding: false,
                enableResizing: false,
            },
        ];

        return availableColumns;
    }, []);

    const {columnVisibility, columnOrder} = React.useMemo(() => {
        const visible = new Set(visibleColumns);
        const columnVisibility = columns.reduce(
            (acc, {id}) => {
                acc[id] = id === 'name' || id === 'actions' || visible.has(id);
                return acc;
            },
            {} as Record<SchedulingColumn, boolean>,
        );
        const columnOrder = [
            ...visibleColumns.filter((col) => columnVisibility[col]),
            ...Object.keys(columnVisibility).filter(
                (col) => !columnVisibility[col as SchedulingColumn],
            ),
        ];
        return {columnVisibility, columnOrder};
    }, [visibleColumns, columns]);

    return {columns, columnVisibility, columnOrder};
}

function NameHeader() {
    const loading = useSelector(getSchedulingOperationsLoading);
    return (
        <SchedulingColumnHeader
            title={i18n('pool-operation')}
            column="name"
            loading={loading}
            allowUnordered
        />
    );
}

type ResourceSummaryProps = {
    item: RowData;
    type: 'usage' | 'demand' | 'guaranteed';
};

function ResourceSummary({item, type}: ResourceSummaryProps) {
    const {dominantResource = 'cpu'} = item;

    const {cpu, gpu, user_memory} = item.resources ?? {};

    const cpuContent = format.NumberSmart(cpu?.[type]) + ' CPU';
    const gpuContent = format.NumberSmart(gpu?.[type]) + ' GPU';
    const memContent = format.Bytes(user_memory?.[type]);

    const l1 = dominantResource === 'cpu' ? cpuContent : gpuContent;
    const l2 =
        dominantResource === 'cpu'
            ? `${gpuContent}, ${memContent}`
            : `${cpuContent}, ${memContent}`;
    return (
        <Flex direction="column" style={{margin: '-8px 0'}} overflow="hidden">
            <Text variant="subheader-1" style={{fontWeight: 'var(--yt-font-weight-bold)'}} ellipsis>
                {l1}
            </Text>
            <Text variant="caption-2" color="secondary" ellipsis>
                {l2}
            </Text>
        </Flex>
    );
}

type EditedNumberProps = {
    value?: number;
    edited?: number;

    type: FormatNumberProps['type'];
};

function EditedNumber({value, edited, type}: EditedNumberProps) {
    const autocalculated = isNaN(edited!);
    const content = autocalculated ? 'Automatically calculated' : 'Explicitly defined';

    return (
        <FormatNumber
            className={block('edited-number', {autocalculated})}
            tooltip={content}
            value={value}
            type={type}
        />
    );
}

function Duration({start}: {start?: string}) {
    if (!start) {
        return null;
    }

    const from = moment(start).valueOf();
    return (
        <Tooltip
            content={
                <MetaTable
                    items={[
                        {
                            key: 'start time',
                            value: format.DateTime(from / 1000),
                        },
                    ]}
                />
            }
        >
            {format.TimeDuration(Date.now() - from)}
        </Tooltip>
    );
}

function RowActions({item}: {item: RowData}) {
    const dispatch = useThunkDispatch();

    const {name, type, isEphemeral, attributes} = item;
    const editable = !isEphemeral && type === 'pool';

    return (
        <DropdownMenu
            items={compact_([
                {
                    action: () => {
                        const exactPath = dispatch(getPoolPathsByName(name))?.orchidPath;
                        if (type === 'pool') {
                            dispatch(openAttributesModal({title: item.name, exactPath}));
                        } else {
                            dispatch(openAttributesModal({title: item.name, attributes}));
                        }
                    },
                    text: 'Show attributes',
                },
                ...(editable
                    ? [
                          {
                              action: () => dispatch(openEditModal(item)),
                              text: 'Edit',
                          },
                          {
                              action: () => dispatch(openPoolDeleteModal(item)),
                              text: 'Delete',
                              theme: 'danger' as const,
                          },
                      ]
                    : []),
            ])}
        />
    );
}

function FairShareUsage({item}: {item: RowData}) {
    const {starvation_status, fairShareRatio, usageRatio} = item;

    const forceTheme = (
        {
            starving: 'warning',
            aggressively_starving: 'danger',
        } as Record<string, 'warning' | 'danger' | undefined>
    )[starvation_status!];

    const title = !forceTheme ? null : (
        <div className={block('starvation-status')}>
            <Label theme={forceTheme} text={format.Readable(starvation_status)} />
        </div>
    );

    return (
        <ShareUsageBar
            className={block('share-usage')}
            shareValue={fairShareRatio}
            shareTitle={'Fair share'}
            usageValue={usageRatio}
            usageTitle={'Usage'}
            forceTheme={forceTheme}
            title={title}
        />
    );
}

function SchedulingColumnHeader(props: ColumnHeaderProps<SchedulingColumn>) {
    const dispatch = useDispatch();

    const [sortState] = useSelector(getSchedulingSortState);

    const order = props.column === sortState?.column ? sortState.order : undefined;

    const lastColumnRef = React.useRef(props.column);

    const byOptions: Pick<typeof props, 'column' | 'order'> = {column: lastColumnRef.current};

    if (sortState?.column && props.options) {
        const item = props.options.find((x) => x.column === sortState.column);
        if (item) {
            Object.assign(byOptions, {column: item.column, order: sortState.order});
        }
    }

    return (
        <ColumnHeader
            {...props}
            order={order}
            {...byOptions}
            onSort={(column, order) => {
                dispatch(schedulingSetSortState(column && order ? [{column, order}] : []));
                if (column && order) {
                    lastColumnRef.current = column;
                }
            }}
        />
    );
}

function SchedulingTableSettings<T extends tanstack.Table<any>>({table}: {table: T}) {
    const mode = useSelector(getSchedulingContentMode);

    return mode === 'custom' ? <TableSettings table={table} /> : null;
}
