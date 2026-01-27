import {CircleQuestion} from '@gravity-ui/icons';
import {Flex, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {FlowComputationDetailsType} from '../../../../../../shared/yt-types';
import {YTText} from '../../../../../components/Text/Text';
import {Tooltip} from '../../../../../components/Tooltip/Tooltip';
import {
    FlowComputationPartitionErrors,
    useFlowComputationPartitionErrorsData,
} from './FlowComputationPartitionErrors/FlowComputationPartitionErrors';
import './FlowComputationPerformance.scss';
import {
    FlowComputationPartitionStatsTable,
    useFlowComputationPartitionStatsTableData,
} from './FlowComputationPerformancePerPartition/FlowComputationPerformancePerPartition';
import i18n from './i18n';

const block = cn('yt-flow-computation-performance');

export function FlowComputationPerformance({
    data,
    onClick,
}: {
    data?: FlowComputationDetailsType;
    onClick: () => void;
}) {
    return (
        <Flex className={block()} gap={5} wrap>
            <FlowComputationPartitionStats
                performance_metrics={data?.performance_metrics}
                onClick={onClick}
            />
            <FlowComputationErrorStats
                partition_with_error_by_time_and_type={data?.partition_with_error_by_time_and_type}
                onClick={onClick}
            />
        </Flex>
    );
}

function PerformanceBlock({header, children}: {header: string; children: React.ReactNode}) {
    return (
        <div className={block('block')}>
            <div>
                <Text className={block('header')} variant="subheader-2">
                    <Tooltip content={i18n('click-to-show-example')}>
                        {header}{' '}
                        <YTText color="secondary">
                            <CircleQuestion className={block('question-icon')} />
                        </YTText>
                    </Tooltip>
                </Text>
            </div>
            {children}
        </div>
    );
}

function FlowComputationPartitionStats({
    performance_metrics,
    onClick,
}: Partial<Pick<FlowComputationDetailsType, 'performance_metrics'>> & {onClick: () => void}) {
    const items = useFlowComputationPartitionStatsTableData(performance_metrics);

    return !items.length ? null : (
        <PerformanceBlock header={i18n('performance-per-partition')}>
            <FlowComputationPartitionStatsTable items={items} onClick={onClick} />
        </PerformanceBlock>
    );
}

function FlowComputationErrorStats({
    partition_with_error_by_time_and_type,
    onClick,
}: Partial<Pick<FlowComputationDetailsType, 'partition_with_error_by_time_and_type'>> & {
    onClick: () => void;
}) {
    const items = useFlowComputationPartitionErrorsData(partition_with_error_by_time_and_type);

    return !items.length ? null : (
        <PerformanceBlock header={i18n('count-of-partitions-with-errors')}>
            <FlowComputationPartitionErrors items={items} onClick={onClick} />
        </PerformanceBlock>
    );
}
