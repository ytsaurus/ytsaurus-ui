import React from 'react';
import {
    FlowComputationDetailsType,
    FlowComputationPartitionErrorsStatsItem,
} from '../../../../../../../shared/yt-types';
import format from '../../../../../../common/hammer/format';
import {
    DataTableGravity,
    TableCell,
    tanstack,
    useTable,
} from '../../../../../../components/DataTableGravity';
import i18n from './i18n';
import {FlowComputationPartitionFilter} from '../../../../../../pages/flow/Flow/FlowComputation/FlowComputationPartitionFilter/FlowComputationPartitionFilter';

const ROW_NAMES = [
    'restart_because_fail',
    'restart_because_rebalancing',
    'has_retryable_errors',
    'total_with_problems',
] as const;
type ErrorType = (typeof ROW_NAMES)[number];

const COLUMN_NAMES = ['1m', '5m', '30m'] as const;
type ErrorStatsColumn = (typeof COLUMN_NAMES)[number];

type ErrorStatsRow = {type: ErrorType} & Partial<
    Record<ErrorStatsColumn, FlowComputationPartitionErrorsStatsItem>
>;

export function useFlowComputationPartitionErrorsData(
    partition_with_error_by_time_and_type?: FlowComputationDetailsType['partition_with_error_by_time_and_type'],
) {
    return React.useMemo(() => {
        const res: Array<ErrorStatsRow> = [];
        const mapByName = new Map<ErrorType, ErrorStatsRow>();
        function getByType(type: ErrorType) {
            const item = mapByName.get(type);
            if (item) {
                return item;
            } else {
                const tmp: ErrorStatsRow = {type};
                mapByName.set(type, tmp);
                res.push(tmp);
                return tmp;
            }
        }

        ROW_NAMES.forEach((n) => {
            const type = n as ErrorType;
            const dst = getByType(type);
            Object.keys(partition_with_error_by_time_and_type ?? {}).forEach((c) => {
                const column = c as keyof Exclude<
                    typeof partition_with_error_by_time_and_type,
                    undefined
                >;
                const metrics = partition_with_error_by_time_and_type?.[column];
                dst[column] = metrics?.[type];
            });
        });

        return res;
    }, [partition_with_error_by_time_and_type]);
}

type ErrorStatsColumnDef = tanstack.ColumnDef<ErrorStatsRow>;

export function FlowComputationPartitionErrors({items}: {items: Array<ErrorStatsRow>}) {
    const columns = React.useMemo(() => {
        const res: Array<ErrorStatsColumnDef> = [
            {
                id: 'type',
                header: () => i18n('type-of-error'),
                size: 200,
                cell: ({row: {original: item}}) => {
                    return <TableCell>{i18n(item.type)}</TableCell>;
                },
            },
            {
                id: '1m',
                header: () => i18n('1m'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {['1m']: colData} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={colData?.example_partition}>
                                {format.Number(colData?.count)}
                            </FlowComputationPartitionFilter>
                        </TableCell>
                    );
                },
            },
            {
                id: '5m',
                header: () => i18n('5m'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {['5m']: colData} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={colData?.example_partition}>
                                {format.Number(colData?.count)}
                            </FlowComputationPartitionFilter>
                        </TableCell>
                    );
                },
            },
            {
                id: '30m',
                header: () => i18n('30m'),
                size: 100,
                cell: ({row: {original: item}}) => {
                    const {['30m']: colData} = item;
                    return (
                        <TableCell>
                            <FlowComputationPartitionFilter partition={colData?.example_partition}>
                                {format.Number(colData?.count)}
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
