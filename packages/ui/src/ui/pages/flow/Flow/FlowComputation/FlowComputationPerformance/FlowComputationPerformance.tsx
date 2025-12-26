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

const block = cn('yt-flow-computation-performance');

export function FlowComputationPerformance({data}: {data?: FlowComputationDetailsType}) {
    return (
        <Flex className={block()} gap={5}>
            <FlowComputationPartitionStats performance_metrics={data?.performance_metrics} />
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
