import cn from 'bem-cn-lite';
import React from 'react';
import {FlowComputationPartitionType} from '../../../../../shared/yt-types';
import format from '../../../../common/hammer/format';
import {concatByAnd} from '../../../../common/hammer/predicate';
import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import {
    DataTableGravity,
    SortIndicator,
    TableCell,
    tanstack,
    useTable,
} from '../../../../components/DataTableGravity';
import Link from '../../../../components/Link/Link';
import Select from '../../../../components/Select/Select';
import {YTText} from '../../../../components/Text/Text';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {useSettingsColumnSizes} from '../../../../hooks/settings/use-settings-column-sizes';
import {FlowPartitionState} from '../../../../pages/flow/flow-components/FlowPartitionState/FlowPartitionState';
import {FlowNodeStatus} from '../../../../pages/flow/Flow/FlowGraph/renderers/FlowGraphRenderer';
import {FlowTab, filtersSlice} from '../../../../store/reducers/flow/filters';
import {useFlowPartitionIdFilter} from '../../../../store/reducers/flow/filters.hooks';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    getFlowPartitionsJobStateFilter,
    getFlowPartitionsStateFilter,
    getFlowPipelinePath,
} from '../../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../../utils/app-url';
import {getFieldStats, statsToSelectItems} from '../../../../utils/field-stats';
import './FlowComputationPartitions.scss';
import i18n from './i18n';
import compact_ from 'lodash/compact';

const block = cn('yt-flow-computation-partitions');

export function FlowComputationPartitions({
    partitions,
}: {
    partitions?: Array<FlowComputationPartitionType>;
}) {
    const {partitionIdFilter, setPartitionIdFilter} = useFlowPartitionIdFilter();
    return (
        <WithStickyToolbar
            className={block()}
            toolbar={
                <Toolbar
                    itemsToWrap={[
                        {
                            node: (
                                <TextInputWithDebounce
                                    className={block('id-filter')}
                                    placeholder={i18n('search-partition-by-id')}
                                    value={partitionIdFilter}
                                    onUpdate={setPartitionIdFilter}
                                />
                            ),
                        },
                        {
                            node: <JobStateFilter partitions={partitions} />,
                        },
                        {
                            node: <StateFilter partitions={partitions} />,
                        },
                    ]}
                />
            }
            content={<FlowComputationPartitionsTable partitions={partitions} />}
        />
    );
}

function JobStateFilter({partitions}: {partitions?: Array<FlowComputationPartitionType>}) {
    const dispatch = useDispatch();
    const value = useSelector(getFlowPartitionsJobStateFilter);

    const items = React.useMemo(() => {
        const stats = getFieldStats(partitions ?? [], 'job_state');
        return statsToSelectItems(stats);
    }, [partitions]);

    return (
        <Select
            value={value}
            items={items}
            label={i18n('job-state') + ':'}
            placeholder="All"
            onUpdate={(newValue) => {
                dispatch(
                    filtersSlice.actions.updateFlowFilters({
                        partitionsJobStateFilter: newValue,
                    }),
                );
            }}
        />
    );
}

function StateFilter({partitions}: {partitions?: Array<FlowComputationPartitionType>}) {
    const dispatch = useDispatch();
    const value = useSelector(getFlowPartitionsStateFilter);

    const items = React.useMemo(() => {
        const stats = getFieldStats(partitions ?? [], 'state');
        return statsToSelectItems(stats);
    }, [partitions]);

    return (
        <Select
            value={value}
            items={items}
            label={i18n('state') + ':'}
            placeholder="All"
            onUpdate={(newValue) => {
                dispatch(
                    filtersSlice.actions.updateFlowFilters({
                        partitionsStateFilter: newValue,
                    }),
                );
            }}
        />
    );
}

function useFlowComputationPartitionsTableData(partitions?: Array<FlowComputationPartitionType>) {
    const {partitionIdFilter} = useFlowPartitionIdFilter();
    const jobStateFilter = useSelector(getFlowPartitionsJobStateFilter);
    const stateFilter = useSelector(getFlowPartitionsStateFilter);

    return {
        items: React.useMemo(() => {
            const lowerId = partitionIdFilter.toLowerCase();

            const jobStates = new Set(jobStateFilter);
            const states = new Set(stateFilter);

            const predicates = compact_([
                partitionIdFilter
                    ? (item: FlowComputationPartitionType) => {
                          return -1 !== item.partition_id.indexOf(lowerId);
                      }
                    : undefined,
                jobStates.size
                    ? (item: FlowComputationPartitionType) => {
                          return jobStates.has(item.job_state);
                      }
                    : undefined,
                states.size
                    ? (item: FlowComputationPartitionType) => {
                          return states.has(item.state);
                      }
                    : undefined,
            ]);

            return partitions?.filter(concatByAnd(...predicates));
        }, [partitionIdFilter, jobStateFilter, stateFilter, partitions]),
    };
}

function FlowComputationPartitionsTable({
    partitions,
}: {
    partitions?: Array<FlowComputationPartitionType>;
}) {
    const {columns} = useFlowWorkersColumns();

    const {items} = useFlowComputationPartitionsTableData(partitions);

    const [sorting, setSorting] = React.useState<tanstack.SortingState>([]);

    const {columnSizes, setColumnSizes} = useSettingsColumnSizes(
        'global::flow::partitionsColumnSizes',
        {minWidth: 80},
    );

    const table = useTable({
        columns,
        data: items ?? [],
        enableColumnPinning: true,
        enableColumnResizing: true,
        state: {
            columnPinning: {
                left: ['partition'],
                right: ['actions'],
            },
            sorting,
            columnSizing: columnSizes,
        },
        onColumnSizingChange: setColumnSizes,
        onSortingChange: setSorting,
        enableSorting: true,
    });

    return (
        <DataTableGravity
            table={table}
            virtualized
            rowHeight={40}
            renderSortIndicator={(props) => {
                return <SortIndicator {...props} />;
            }}
        />
    );
}

type FlowPartitionsColumnDef = tanstack.ColumnDef<FlowComputationPartitionType>;

function useFlowWorkersColumns() {
    const res = React.useMemo(() => {
        const columns: Array<FlowPartitionsColumnDef> = [
            {
                id: 'partition',
                header: () => i18n('partition'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <YTText ellipsis>
                                <PartitionIdCell
                                    id={item.partition_id}
                                    computation_id={item.computation_id}
                                />
                            </YTText>
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
                accessorFn(d) {
                    return d.partition_id;
                },
            },
            {
                id: 'worker',
                header: () => i18n('worker'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <YTText ellipsis>{item.current_worker_address}</YTText>
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
                accessorFn(d) {
                    return d.partition_id;
                },
            },
            {
                id: 'key_range',
                header: () => i18n('key-range'),
                size: 400,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <YTText ellipsis>{item.key_or_range}</YTText>
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
                accessorFn(d) {
                    return d.lexicographically_serialized_key_or_range;
                },
            },
            {
                id: 'cpu_usage',
                header: () => i18n('cpu-usage'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Number(item.cpu_usage)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.cpu_usage;
                },
            },
            {
                id: 'memory_usage',
                header: () => i18n('memory-usage'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Bytes(item.memory_usage)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.memory_usage;
                },
            },
            {
                id: 'message_per_second',
                header: () => i18n('message-per-second'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Number(item.messages_per_second)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.messages_per_second;
                },
            },
            {
                id: 'bytes_per_second',
                header: () => i18n('bytes-per-second'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{format.Bytes(item.bytes_per_second)}</TableCell>;
                },
                enableSorting: true,
                accessorFn(d) {
                    return d.bytes_per_second;
                },
            },
            {
                id: 'health',
                header: () => i18n('health'),
                size: 120,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <FlowNodeStatus status={item.status} />
                        </TableCell>
                    );
                },
                accessorFn(d) {
                    return d.status;
                },
            },
            {
                id: 'state',
                header: () => i18n('state'),
                size: 120,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <FlowPartitionState state={item.state} />
                        </TableCell>
                    );
                },
                accessorFn(d) {
                    return d.state;
                },
            },
            {
                id: 'job_state',
                header: () => i18n('job-state'),
                size: 120,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <FlowPartitionState state={item.job_state} />
                        </TableCell>
                    );
                },
                accessorFn(d) {
                    return d.job_state;
                },
            },
            {
                id: 'actions',
                header: () => null,
                size: 50,
                cell: ({row: {original: item}}) => {
                    return (
                        <TableCell>
                            <ClickableAttributesButton
                                title={item.partition_id}
                                attributes={item}
                            />
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
            },
        ];

        return {columns};
    }, []);
    return res;
}

function PartitionIdCell({id, computation_id}: {id: string; computation_id: string}) {
    const path = useSelector(getFlowPipelinePath);

    return (
        <Link
            url={makeFlowLink({
                path,
                computation: computation_id,
                partition: id,
                tab: FlowTab.COMPUTATIONS,
            })}
            routed
        >
            {id}
        </Link>
    );
}
