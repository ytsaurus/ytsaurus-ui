import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import moment from 'moment';

import compact_ from 'lodash/compact';

import {DropdownMenu, Flex, Progress, Text} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import ColumnHeader from '../../../../../../components/ColumnHeader/ColumnHeader';
import {
    DataTableGravity,
    TableCell,
    useTable,
    tanstack,
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
import {
    getSchedulingContentMode,
    getSchedulingOverviewTableItems,
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
import {openEditModal} from '../../../../../../store/actions/scheduling/scheduling';
import {openPoolDeleteModal} from '../../../../../../store/actions/scheduling/scheduling-ts';
import {getProgressTheme} from '../../../../../../utils/progress';

const block = cn('yt-scheduling-table');

export type RowData = ReturnType<typeof getSchedulingOverviewTableItems>[number];

export function SchedulingTable() {
    const items = useSelector(getSchedulingOverviewTableItems);
    const columns = useSchedulingTableColumns();

    const table = useTable({
        columns,
        data: items,
        enableColumnPinning: true,
        state: {
            columnPinning: {
                left: ['name'],
                right: ['actions'],
            },
            columnSizing: {startOffset: 100},
        },
    });

    return (
        <DataTableGravity
            table={table}
            virtualized
            rowHeight={49}
        />
    );
}

type SchedulintTableMode = ReturnType<typeof getSchedulingContentMode>;

const COLUMNS_BY_MODE: Record<SchedulintTableMode, Array<SchedulingColumn>> = {
    summary: [
        'weight',
        'type',
        'user',
        'dominant_resource',
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
        header: () => <ColumnHeader column={id} title={caption} />,
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
        header: () => <ColumnHeader column={id} title={caption} />,
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
                size: 300,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <NameCell row={item} />
                        </TableCell>
                    );
                },
            },
            {
                id: 'actions',
                header: () => null,
                size: 50,
                cell: ({row: {original: item}}) => {
                    return <RowActions item={item} />;
                },
            },
            {
                id: 'weight',
                header: () => <ColumnHeader column={'weight'} />,
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
                header: () => <ColumnHeader column={'type'} />,
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
                header: () => <ColumnHeader column="user" title="Owner" />,
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
                id: 'usage',
                header: () => <ColumnHeader column="usage" />,
                cell: ({row: {original: item}}) => {
                    const {} = item;
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="usage" />
                        </TableCell>
                    );
                },
                size: 140,
            },
            {
                id: 'demand',
                header: () => <ColumnHeader column="demand" />,
                cell: ({row: {original: item}}) => {
                    const {} = item;
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="demand" />
                        </TableCell>
                    );
                },
                size: 140,
            },
            {
                id: 'guaranteed',
                header: () => <ColumnHeader column="guaranteed" title="Guarantee" />,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ResourceSummary item={item} type="guaranteed" />
                        </TableCell>
                    );
                },
                size: 140,
            },
            {
                id: 'operation_overview',
                header: () => <ColumnHeader column="running" />,
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
                header: () => <ColumnHeader column="duration" />,
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
                header: () => <ColumnHeader column="FI" />,
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
                    <ColumnHeader
                        column="operation_progress"
                        title={childTableItems.operation_progress.caption}
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
                    <ColumnHeader
                        column="running_operation_progress"
                        title={childTableItems.running_operation_progress.caption}
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
        ];

        const map = availableColumns.reduce((acc, item) => {
            acc.set(item.id!, item);
            return acc;
        }, new Map<SchedulingColumn, (typeof availableColumns)[number]>());

        return compact_(
            ['name', ...visibleColumns, 'actions'].map((column) => {
                return map.get(column);
            }),
        );
    }, [visibleColumns]);
    return columns;
}

function NameHeader() {
    const loading = useSelector(getSchedulingOperationsLoading);
    return <ColumnHeader title={i18n('pool-operation')} column="name" loading={loading} />;
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
