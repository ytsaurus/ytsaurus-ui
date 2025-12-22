import cn from 'bem-cn-lite';
import React from 'react';
import {FlowComputationPartitionType} from '../../../../../shared/yt-types';
import format from '../../../../common/hammer/format';
import ClickableAttributesButton from '../../../../components/AttributesButton/ClickableAttributesButton';
import {
    DataTableGravity,
    SortIndicator,
    TableCell,
    tanstack,
    useTable,
} from '../../../../components/DataTableGravity';
import Link from '../../../../components/Link/Link';
import {YTText} from '../../../../components/Text/Text';
import TextInputWithDebounce from '../../../../components/TextInputWithDebounce/TextInputWithDebounce';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {FlowPartitionState} from '../../../../pages/flow/flow-components/FlowPartitionState/FlowPartitionState';
import {FlowTab} from '../../../../store/reducers/flow/filters';
import {useFlowPartitionIdFilter} from '../../../../store/reducers/flow/filters.hooks';
import {useSelector} from '../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../../utils/app-url';
import {FlowNodeStatus} from '../FlowGraph/renderers/FlowGraphRenderer';
import './FlowComputationPartitions.scss';
import i18n from './i18n';

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
                    ]}
                />
            }
            content={<FlowComputationPartitionsTable partitions={partitions} />}
        />
    );
}

function useFlowComputationPartitionsTableData(partitions?: Array<FlowComputationPartitionType>) {
    const {partitionIdFilter} = useFlowPartitionIdFilter();
    return {
        items: React.useMemo(() => {
            const lowerId = partitionIdFilter.toLowerCase();
            return partitions?.filter((item) => {
                return -1 !== item.partition_id.indexOf(lowerId);
            });
        }, [partitionIdFilter, partitions]),
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
        },
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
                            <PartitionIdCell
                                id={item.partition_id}
                                computation_id={item.computation_id}
                            />
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
                    return <TableCell>{item.current_worker_address}</TableCell>;
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
                            <YTText ellipsis>
                                {item.lower_key} - {item.upper_key}
                            </YTText>
                        </TableCell>
                    );
                },
                enableColumnFilter: false,
                enableHiding: false,
                accessorFn(d) {
                    return d.lower_key + d.upper_key;
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
