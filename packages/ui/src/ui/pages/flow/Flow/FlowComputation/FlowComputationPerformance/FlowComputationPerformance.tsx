import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {FlowComputationDetailsType} from '../../../../../../shared/yt-types';
import './FlowComputationPerformance.scss';
import {
    FlowComputationPartitionStatsTable,
    useFlowComputationPartitionStatsTableData,
} from './FlowComputationPerformancePerPartition/FlowComputationPerformancePerPartition';
import i18n from './i18n';
import {
    FlowComputationPartitionErrors,
    useFlowComputationPartitionErrorsData,
} from './FlowComputationPartitionErrors/FlowComputationPartitionErrors';

const block = cn('yt-flow-computation-performance');

export function FlowComputationPerformance({data}: {data?: FlowComputationDetailsType}) {
    return (
        <Flex className={block()} gap={5} wrap>
            <FlowComputationPartitionStats performance_metrics={data?.performance_metrics} />
            <FlowComputationErrorStats
                partition_with_error_by_time_and_type={data?.partition_with_error_by_time_and_type}
            />
        </Flex>
    );
}

function PerformanceBlock({header, children}: {header: string; children: React.ReactNode}) {
    return (
        <div className={block('block')}>
            <div>
                <Text className={block('header')} variant="subheader-2">
                    {header}
                </Text>
            </div>
            {children}
        </div>
    );
}

function FlowComputationPartitionStats({
    performance_metrics,
}: Partial<Pick<FlowComputationDetailsType, 'performance_metrics'>>) {
    const items = useFlowComputationPartitionStatsTableData(performance_metrics);

    return !items.length ? null : (
        <PerformanceBlock header={i18n('performance-per-partition')}>
            <FlowComputationPartitionStatsTable items={items} />
        </PerformanceBlock>
    );
}

function FlowComputationErrorStats({
    partition_with_error_by_time_and_type,
}: Partial<Pick<FlowComputationDetailsType, 'partition_with_error_by_time_and_type'>>) {
    const items = useFlowComputationPartitionErrorsData(partition_with_error_by_time_and_type);

    return !items.length ? null : (
        <PerformanceBlock header={i18n('performance-per-partition')}>
            <FlowComputationPartitionErrors items={items} />
        </PerformanceBlock>
    );
}
