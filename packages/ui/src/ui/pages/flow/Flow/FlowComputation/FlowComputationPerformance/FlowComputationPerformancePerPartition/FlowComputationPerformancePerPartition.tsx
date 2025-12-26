import React from 'react';
import {FlowComputationDetailsType} from '../../../../../../../shared/yt-types';
import format from '../../../../../../common/hammer/format';
import {
    DataTableGravity,
    TableCell,
    tanstack,
    useTable,
} from '../../../../../../components/DataTableGravity';
import {FlowComputationPartitionFilter} from '../../../../../../pages/flow/Flow/FlowComputation/FlowComputationPartitionFilter/FlowComputationPartitionFilter';
import i18n from './i18n';

const ROW_NAMES = ['cpu_usage', 'memory_usage', 'messages_per_second', 'bytes_per_second'] as const;
type PerformanceRowName = (typeof ROW_NAMES)[number];

const COLUMN_NAMES = ['total', 'average', 'max', 'min'] as const;
type PerformanceColumn = (typeof COLUMN_NAMES)[number];

type PerformanceRow = {name: PerformanceRowName} & Partial<Record<PerformanceColumn, number>> &
    Partial<Record<`${PerformanceColumn}_example_partition`, string>>;

export function FlowComputationPartitionStatsTable({items}: {items: Array<PerformanceRow>}) {
    return <PerformancePerPartitionsTable items={items} />;
}

export function useFlowComputationPartitionStatsTableData(
    performance_metrics?: FlowComputationDetailsType['performance_metrics'],
) {
    return React.useMemo(() => {
        const res: Array<PerformanceRow> = [];
        const mapByName = new Map<PerformanceRowName, PerformanceRow>();
        function getByName(name: PerformanceRowName) {
            const item = mapByName.get(name);
            if (item) {
                return item;
            } else {
                const tmp: PerformanceRow = {name};
                mapByName.set(name, tmp);
                res.push(tmp);
                return tmp;
            }
        }

        ROW_NAMES.forEach((n) => {
            const name = n as PerformanceRowName;
            const dst = getByName(name);
            Object.keys(performance_metrics ?? {}).forEach((c) => {
                const column = c as PerformanceColumn;
                const metrics = performance_metrics?.[c];
                dst[column] = metrics?.[name];
                const example = metrics?.[`${name}_example_partition`];
                if (example) {
                    dst[`${column}_example_partition`] = example;
                }
            });
        });

        return res;
    }, [performance_metrics]);
}

type PerformancePerPartitionsColumnDef = tanstack.ColumnDef<PerformanceRow>;

function PerformancePerPartitionsTable({items}: {items: Array<PerformanceRow>}) {
    const columns = React.useMemo(() => {
        function formatByName(name: PerformanceRowName, v?: number) {
            switch (name) {
                case 'memory_usage':
                    return format.Bytes(v);
                case 'bytes_per_second':
                    return format.BytesPerSecond(v);
                case 'messages_per_second':
                    return format.NumberWithSuffix(v);
                default:
                    return format.Number(v);
            }
        }
        const res: Array<PerformancePerPartitionsColumnDef> = [
            {
                id: 'name',
                header: () => i18n('parameter'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{i18n(item.name)}</TableCell>;
                },
            },
            {
                id: 'total',
                header: () => i18n('total'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {total, total_example_partition} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={total_example_partition}>
                                {formatByName(item.name, total)}{' '}
                            </FlowComputationPartitionFilter>
                        </TableCell>
                    );
                },
            },
            {
                id: 'avg',
                header: () => i18n('average'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {average, average_example_partition} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={average_example_partition}>
                                {formatByName(item.name, average)}
                            </FlowComputationPartitionFilter>
                        </TableCell>
                    );
                },
            },
            {
                id: 'min',
                header: () => i18n('min'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {min, min_example_partition} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={min_example_partition}>
                                {formatByName(item.name, min)}
                            </FlowComputationPartitionFilter>
                        </TableCell>
                    );
                },
            },
            {
                id: 'max',
                header: () => i18n('max'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {max, max_example_partition} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={max_example_partition}>
                                {formatByName(item.name, max)}
                            </FlowComputationPartitionFilter>
                        </TableCell>
                    );
                },
            },
        ];
        return res;
    }, []);

    const table = useTable({
        columns,
        data: items ?? [],
    });

    return <DataTableGravity table={table} virtualized rowHeight={40} />;
}
