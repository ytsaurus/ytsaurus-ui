import React from 'react';
import cn from 'bem-cn-lite';

import {Graph} from '@gravity-ui/graph';
import {Flex, Progress, ProgressTheme, Text} from '@gravity-ui/uikit';

import {FlowComputation} from '../../../../../../../shared/yt-types';

import format from '../../../../../../common/hammer/format';

import Link from '../../../../../../components/Link/Link';

import {FlowGraphBlockItem} from '../FlowGraph';
import Icon from '../../../../../../components/Icon/Icon';

import {FlowMeta} from './FlowMeta';
import './Computation.scss';

const block = cn('yt-flow-computation');

type ComputationProps = {
    className?: string;

    graph: Graph;
    item: FlowGraphBlockItem<'computation'>;
};

export function Computation({item, className}: ComputationProps) {
    const {cpu_usage_current, memory_usage_current} = item.meta?.metrics ?? {};

    return (
        <div className={className}>
            <Flex gap={4} alignItems="baseline" style={{paddingBottom: '10px'}}>
                <Flex grow={1}>
                    <Text variant="caption-2">
                        <Link onClick={() => alert('not implemented')}>
                            {item.name} <Icon awesome="external-link" />
                        </Link>
                    </Text>
                </Flex>
                <Flex grow={1}>
                    <Text variant="caption-1" color="secondary" ellipsis>
                        {item.meta?.group_by_schema_str}
                    </Text>
                </Flex>
            </Flex>
            <FlowMeta
                className={block('meta')}
                items={[
                    {
                        label: 'CPU Usage',
                        value: format.Number(cpu_usage_current, {
                            digits: cpu_usage_current! > 1 ? 1 : 2,
                        }),
                        grow: 1,
                    },
                    {
                        label: 'RAM Usage',
                        value: format.Bytes(memory_usage_current),
                        grow: 1,
                    },
                    {
                        label: 'Epoch, per/s',
                        value: format.Number(item.meta?.epoches_per_second),
                    },
                ]}
            />
            <ComputaionProgress stats={item.meta?.partitions_stats} />
        </div>
    );
}

type ComputationProgressProps = {
    stats?: FlowComputation['partitions_stats'];
};

type FlowComputationPartitionStates = keyof FlowComputation['partitions_stats']['count_by_state'];
const STATE_TO_THEME: Record<FlowComputationPartitionStates, ProgressTheme> = {
    Completed: 'info',
    Transient: 'warning',
    Executing: 'success',
    Interrupted: 'default',
};

function ComputaionProgress({stats}: ComputationProgressProps) {
    const {count = NaN, count_by_state} = stats ?? {};
    const {stack, history} = React.useMemo(() => {
        const history: ComputationProgressHistoryProps['data'] = [];
        const stack = Object.keys(count_by_state ?? {}).map((k) => {
            const key = k as keyof Exclude<typeof count_by_state, undefined>;
            const v = count_by_state?.[key] ?? NaN;
            const theme = STATE_TO_THEME[key] ?? 'default';
            history.push({value: v, type: key});

            return {value: (v / count) * 100, theme};
        });
        return {stack, history};
    }, [stats, count]);

    return (
        <div>
            <Progress className={block('progress')} stack={stack} size="xs" />
            <Flex style={{paddingTop: '8px'}} alignItems="baseline" gap={2}>
                <Text variant="caption-2">
                    {format.Number(count)}{' '}
                    <Text color="secondary" variant="inherit">
                        partitions
                    </Text>
                </Text>
                <ComputationProgressHistory data={history} />
            </Flex>
        </div>
    );
}

type ComputationProgressHistoryProps = {
    data: Array<{value?: number; type: FlowComputationPartitionStates}>;
};

function ComputationProgressHistory({data}: ComputationProgressHistoryProps) {
    return (
        <Flex alignItems="baseline" grow={1} gap={2} justifyContent="end">
            {data.map(({value, type}) => {
                return <ComputationProgressHistoryItem value={value} type={type} />;
            })}
        </Flex>
    );
}

function ComputationProgressHistoryItem({
    value,
    type,
}: {
    value?: number;
    type: FlowComputationPartitionStates;
}) {
    return !value ? null : (
        <Flex alignItems="baseline">
            <div>
                <div
                    className={block('progress-history-item-color', {
                        theme: STATE_TO_THEME[type] ?? 'default',
                    })}
                />
            </div>
            <Text variant="caption-2">{value}</Text>
        </Flex>
    );
}
