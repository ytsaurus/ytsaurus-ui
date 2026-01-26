import cn from 'bem-cn-lite';
import moment from 'moment';
import React from 'react';

import {DropdownMenu, Flex, Progress, Text} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import ColumnHeader, {
    ColumnHeaderProps,
} from '../../../../../../components/ColumnHeader/ColumnHeader';
import {
    DataTableGravity,
    TableCell,
    TableSettings,
    tanstack,
    useTable,
} from '../../../../../../components/DataTableGravity';
import {
    FormatNumber,
    FormatNumberProps,
} from '../../../../../../components/FormatNumber/FormatNumber';
import Label from '../../../../../../components/Label/Label';
import MetaTable from '../../../../../../components/MetaTable/MetaTable';
import {OperationType} from '../../../../../../components/OperationType/OperationType';
import {SubjectCard} from '../../../../../../components/SubjectLink/SubjectLink';
import {Tooltip} from '../../../../../../components/Tooltip/Tooltip';
import {getSchedulingOperationsLoading} from '../../../../../../store/selectors/scheduling/expanded-pools';
import {
    getSchedulingContentMode,
    getSchedulingLoading,
    getSchedulingOverviewTableItems,
    getSchedulingShowAbsResources,
    getSchedulingSortState,
    getSchedulingTreeMainResource,
} from '../../../../../../store/selectors/scheduling/scheduling';

import {KeysByType} from '../../../../../../../@types/types';
import {formatTimeDuration} from '../../../../../../components/TimeDuration/TimeDuration';
import {useSettingsColumnSizes} from '../../../../../../hooks/settings/use-settings-column-sizes';
import {useSettingsVisibleColumns} from '../../../../../../hooks/settings/use-settings-column-visibility';
import ShareUsageBar from '../../../../../../pages/scheduling/Content/controls/ShareUsageBar';
import {openAttributesModal} from '../../../../../../store/actions/modals/attributes-modal';
import {getPoolPathsByName} from '../../../../../../store/actions/scheduling/expanded-pools';
import {
    openEditModal,
    schedulingSetSortState,
} from '../../../../../../store/actions/scheduling/scheduling';
import {openPoolDeleteModal} from '../../../../../../store/actions/scheduling/scheduling-ts';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {getSchedulingOperationRefId} from '../../../../../../store/selectors/scheduling/attributes-to-filter';
import {getSchedulingOverivewColumns} from '../../../../../../store/selectors/scheduling/overview-columns';
import {getProgressTheme} from '../../../../../../utils/progress';
import {SchedulingColumn, childTableItems} from '../../../../../../utils/scheduling/detailsTable';
import i18n from './i18n';
import {NameCell} from './NameCell';
import {PoolAbc} from './PoolAbc';
import './SchedulingTable.scss';

const block = cn('yt-scheduling-table');

export type RowData = ReturnType<typeof getSchedulingOverviewTableItems>[number];

export function SchedulingTable() {
    const {columnSizes, setColumnSizes} = useSettingsColumnSizes(
        'global::scheduling::overviewColumnSizes',
        {minWidth: 80},
    );

    const {onColumnVisibilityChange, onColumnOrderChange} = useSettingsVisibleColumns(
        'global::scheduling::overviewColumns',
    );

    const {columns, columnVisibility, columnOrder} = useSchedulingTableColumns();
    const items = useSelector(getSchedulingOverviewTableItems);

    const operationRefId = useSelector(getSchedulingOperationRefId);

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

    const {scrollToIndex, isHighlightedRow} = React.useMemo(() => {
        if (!operationRefId) {
            return {};
        }

        return {
            scrollToIndex: items.findIndex(({id}) => operationRefId === id),
            isHighlightedRow: (item?: (typeof items)[number]) => {
                return item?.id === operationRefId;
            },
        };
    }, [operationRefId, items]);

    return (
        <DataTableGravity
            className={block()}
            table={table}
            virtualized
            rowHeight={49}
            scrollToIndex={scrollToIndex}
            isHighlightedRow={isHighlightedRow}
        />
    );
}

type SchedulintTableMode = ReturnType<typeof getSchedulingContentMode>;

const COLUMNS_BY_MODE: Record<SchedulintTableMode, Array<SchedulingColumn>> = {
    summary: [
        'weight',
        'view_mode',
        'owner',
        'dominant_resource',
        'fair_share_usage',
        'usage',
        'demand',
        'guaranteed',
        'operation_overview',
        'duration',
    ],
    cpu: [
        'weight',
        'min_resources_cpu',
        'abs_guaranteed_cpu',
        'abs_demand_cpu',
        'resource_detailed_cpu',
        'abs_usage_cpu',
        'resource_limit_cpu',
    ],
    memory: [
        'weight',
        'min_resources_memory',
        'abs_guaranteed_memory',
        'abs_demand_memory',
        'resource_detailed_memory',
        'abs_usage_memory',
        'resource_limit_memory',
    ],

    gpu: [
        'weight',
        'min_resources_gpu',
        'abs_guaranteed_gpu',
        'abs_demand_gpu',
        'resource_detailed_gpu',
        'abs_usage_gpu',
        'resource_limit_gpu',
    ],

    user_slots: [
        'weight',
        'min_resources_user_slots',
        'abs_guaranteed_user_slots',
        'abs_demand_user_slots',
        'resource_detailed_user_slots',
        'abs_usage_user_slots',
        'resource_limit_user_slots',
    ],

    operations: [
        'running_operation_count',
        'max_running_operation_count',
        'running_operation_progress',
        'operation_count',
        'max_operation_count',
        'operation_progress',
    ],

    integral_guarantees: [
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
    {
        type = 'NumberSmart',
        ...rest
    }: Partial<Pick<FormatNumberProps, 'type' | 'hideApproximateChar'>> = {},
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
                    <FormatNumber value={value} type={type} {...rest} />
                </TableCell>
            );
        },
    };
}

function makeReadableFieldColumn(
    id: KeyByGetterReturnType<string | undefined>,
    options?: {size?: number},
) {
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
        ...options,
    };
}

type SchedulingColumnDef = Omit<tanstack.ColumnDef<RowData>, 'id'> & {id: SchedulingColumn};

const DurationMemo = React.memo(Duration);

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
                size: 100,
            },
            {
                id: 'view_mode',
                header: () => (
                    <SchedulingColumnHeader column={'view_mode'} title="Mode" allowUnordered />
                ),
                cell: ({row: {original: item}}) => {
                    const {type, mode} = item;
                    return (
                        <TableCell>
                            {type === 'pool' ? (
                                <Text variant="inherit" color="secondary">
                                    {format.ReadableField(mode)}
                                </Text>
                            ) : (
                                <OperationType value={item.operationType} />
                            )}
                        </TableCell>
                    );
                },
                size: 100,
            },
            {
                id: 'owner',
                header: () => (
                    <SchedulingColumnHeader column="owner" title="Owner" allowUnordered />
                ),
                cell: ({row: {original: item}}) => {
                    const {user} = item;

                    const content =
                        item.type === 'operation' ? (
                            user ? (
                                <SubjectCard name={user} type="user" />
                            ) : (
                                format.NO_VALUE
                            )
                        ) : (
                            <PoolAbc pool={item} />
                        );

                    return <TableCell>{content}</TableCell>;
                },
            },
            makeReadableFieldColumn('dominant_resource', {size: 100}),
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
                            {column: 'fair_share' as const, title: 'Ratio', allowUnordered: true},
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="usage" />
                        </TableCell>
                    );
                },
                size: 100,
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
                            {column: 'fair_share' as const, title: 'Ratio', allowUnordered: true},
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="demand" />
                        </TableCell>
                    );
                },
                size: 100,
            },
            {
                id: 'guaranteed',
                header: () => (
                    <SchedulingColumnHeader
                        column="abs_effective_guaranteed_cpu"
                        title="Guarantee"
                        options={[
                            {
                                column: 'abs_effective_guaranteed_cpu' as const,
                                title: 'CPU',
                                allowUnordered: true,
                            },
                            {
                                column: 'abs_effective_guaranteed_gpu' as const,
                                title: 'GPU',
                                allowUnordered: true,
                            },
                            {
                                column: 'abs_effective_guaranteed_memory' as const,
                                title: 'RAM',
                                allowUnordered: true,
                            },
                            {
                                column: 'fair_share' as const,
                                title: 'Ratio',
                                allowUnordered: true,
                            },
                        ]}
                    />
                ),
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="effectiveGuaranteed" />
                        </TableCell>
                    );
                },
                size: 100,
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
                    const {
                        maxOperationCount,
                        maxOperationCountEdited,
                        runningOperationCount,
                        type,
                    } = item;

                    if (type === 'operation') {
                        return <TableCell>{format.NO_VALUE}</TableCell>;
                    }

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
                size: 120,
            },
            {
                id: 'duration',
                header: () => <SchedulingColumnHeader column="duration" />,
                cell: ({row: {original: item}}) => {
                    const {startTime} = item;
                    return (
                        <TableCell>
                            <DurationMemo start={startTime} />
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
                size: 50,
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
            makeNumberColumn('abs_demand_cpu', {hideApproximateChar: true}),
            makeNumberColumn('abs_demand_gpu', {hideApproximateChar: true}),
            makeNumberColumn('abs_demand_memory', {type: 'Bytes', hideApproximateChar: true}),
            makeNumberColumn('abs_demand_user_slots'),
            makeNumberColumn('abs_guaranteed_cpu', {hideApproximateChar: true}),
            makeNumberColumn('abs_guaranteed_gpu', {hideApproximateChar: true}),
            makeNumberColumn('abs_guaranteed_memory', {type: 'Bytes', hideApproximateChar: true}),
            makeNumberColumn('abs_guaranteed_user_slots'),
            makeNumberColumn('abs_usage_cpu', {hideApproximateChar: true}),
            makeNumberColumn('abs_usage_gpu', {hideApproximateChar: true}),
            makeNumberColumn('abs_usage_memory', {type: 'Bytes', hideApproximateChar: true}),
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
            makeNumberColumn('min_resources_cpu', {hideApproximateChar: true}),
            makeNumberColumn('min_resources_gpu', {hideApproximateChar: true}),
            makeNumberColumn('min_resources_memory', {type: 'Bytes', hideApproximateChar: true}),
            makeNumberColumn('min_resources_user_slots'),
            makeNumberColumn('operation_count'),
            makeNumberColumn('resource_detailed_cpu', {hideApproximateChar: true}),
            makeNumberColumn('resource_detailed_gpu', {hideApproximateChar: true}),
            makeNumberColumn('resource_detailed_memory', {
                type: 'Bytes',
                hideApproximateChar: true,
            }),
            makeNumberColumn('resource_detailed_user_slots'),
            makeNumberColumn('resource_limit_cpu'),
            makeNumberColumn('resource_limit_gpu'),
            makeNumberColumn('resource_limit_memory', {type: 'Bytes', hideApproximateChar: true}),
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
    const expandedeLoading = useSelector(getSchedulingOperationsLoading);
    const loading = useSelector(getSchedulingLoading);
    return (
        <SchedulingColumnHeader
            title={i18n('pool-operation')}
            column="name"
            loading={loading || expandedeLoading}
            allowUnordered
        />
    );
}

type ResourceSummaryProps = {
    item: RowData;
    type: 'usage' | 'demand' | 'effectiveGuaranteed';
};

function ResourceSummary({item, type}: ResourceSummaryProps) {
    const showAbsResources = useSelector(getSchedulingShowAbsResources);
    const dominantResource = useSelector(getSchedulingTreeMainResource) ?? 'CPU';

    const {fairShareRatio} = item;

    if (!showAbsResources && !fairShareRatio) {
        return <TableCell>{format.Number(undefined)}</TableCell>;
    }

    if (!showAbsResources) {
        return (
            <TableCell>
                <FormatNumber value={fairShareRatio} type="NumberSmart" />
            </TableCell>
        );
    }

    const {resources} = item ?? {};
    const cpu = resources?.cpu?.[type];
    const gpu = resources?.gpu?.[type];
    const user_memory = resources?.user_memory?.[type];

    if (showAbsResources && !cpu && !gpu && !user_memory) {
        return <TableCell>{format.Number(undefined)}</TableCell>;
    }

    const cpuContent = format.NumberSmart(cpu) + ' CPU';
    const gpuContent = format.NumberSmart(gpu) + ' GPU';
    const memContent = format.Bytes(user_memory) + ' RAM';

    const l1 = dominantResource === 'cpu' ? cpuContent : gpuContent;
    const l2 =
        dominantResource === 'cpu'
            ? [gpu && gpuContent, memContent].filter(Boolean).join(', ')
            : [cpu && cpuContent, memContent].filter(Boolean).join(', ');

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
    const [now, setNow] = React.useState(Date.now());

    React.useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!start) {
        return null;
    }

    const from = moment(start).valueOf();
    if (!from) {
        return null;
    }

    return (
        <Tooltip
            className={block('duration')}
            ellipsis
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
            {formatTimeDuration(Math.round((now - from) / 1000) * 1000)}
        </Tooltip>
    );
}

function RowActions({item}: {item: RowData}) {
    const dispatch = useDispatch();

    const {type, isEphemeral} = item;
    const editable = !isEphemeral && type === 'pool';

    return (
        editable && (
            <DropdownMenu
                switcherWrapperClassName={block('actions')}
                items={[
                    {
                        text: 'Attributes',
                        action: () => {
                            const exactPath = dispatch(getPoolPathsByName(item.name))?.orchidPath;
                            if (type === 'pool') {
                                dispatch(openAttributesModal({title: item.name, exactPath}));
                            }
                        },
                    },
                    {
                        action: () => dispatch(openEditModal(item)),
                        text: 'Edit',
                    },
                    {
                        action: () => dispatch(openPoolDeleteModal(item)),
                        text: 'Delete',
                        theme: 'danger' as const,
                    },
                ]}
            />
        )
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
            onSort={(column, order, {currentOrder}) => {
                dispatch(
                    schedulingSetSortState(
                        column && order
                            ? [
                                  {
                                      column: currentOrder
                                          ? column
                                          : (lastColumnRef.current ?? column),
                                      order,
                                  },
                              ]
                            : [],
                    ),
                );
                if (column) {
                    lastColumnRef.current = column;
                }
            }}
            sortIconSize={14}
        />
    );
}

function SchedulingTableSettings<T extends tanstack.Table<any>>({table}: {table: T}) {
    const mode = useSelector(getSchedulingContentMode);

    return mode === 'custom' ? <TableSettings table={table} /> : null;
}
