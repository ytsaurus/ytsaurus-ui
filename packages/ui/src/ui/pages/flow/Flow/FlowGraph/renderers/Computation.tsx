import React from 'react';
import cn from 'bem-cn-lite';

import {Flex, Progress, ProgressTheme, Text} from '@gravity-ui/uikit';

import {FlowComputation} from '../../../../../../shared/yt-types';

import format from '../../../../../common/hammer/format';
import MetaTable from '../../../../../components/MetaTable/MetaTable';
import {addProgressStackSpacers} from '../../../../../utils/progress';

import {FlowGraphBlockItem} from '../FlowGraph';

import {
    FlowCaption1,
    FlowCaption2,
    FlowMessages,
    TextWithHighConsumption,
} from './FlowGraphRenderer';
import {FlowMeta} from './FlowMeta';

import './Computation.scss';

const block = cn('yt-flow-computation');

type ComputationProps = {
    className?: string;

    detailed?: boolean;

    item: Omit<FlowGraphBlockItem<'computation'>, 'is'>;
};

export function Computation({detailed, item, className}: ComputationProps) {
    const {cpu_usage_10m, memory_usage_10m} = item.meta?.metrics ?? {};
    const {highlight_cpu_usage, hightlight_memory_usage} = item.meta ?? {};

    return (
        <div className={block(null, className)}>
            <Flex className={block('name')} gap={4} alignItems="baseline">
                <Flex grow={1} overflow="hidden">
                    <FlowCaption2 text={item.name} />
                </Flex>
                <Flex grow={1} overflow="hidden">
                    <FlowCaption1 text={item.meta?.group_by_schema_str} />
                </Flex>
            </Flex>
            <FlowMeta
                className={block('meta')}
                items={[
                    {
                        label: 'CPU Usage',
                        value: (
                            <TextWithHighConsumption
                                highConsumption={highlight_cpu_usage}
                                detailed={detailed}
                            >
                                {format.Number(cpu_usage_10m, {
                                    digits: cpu_usage_10m! > 1 ? 1 : 2,
                                })}
                            </TextWithHighConsumption>
                        ),
                    },
                    {
                        label: 'RAM Usage',
                        value: (
                            <TextWithHighConsumption
                                highConsumption={hightlight_memory_usage}
                                detailed={detailed}
                            >
                                {format.Bytes(memory_usage_10m)}
                            </TextWithHighConsumption>
                        ),
                    },
                    {
                        label: 'Epoch, pcs/s',
                        value: format.Number(item.meta?.epoch_per_second),
                    },
                ]}
            />
            <ComputaionProgress stats={item.meta?.partitions_stats} />
            {detailed && <ComputationDetails item={item} />}
            {detailed && <FlowMessages data={item.meta.messages} />}
        </div>
    );
}

type ComputationProgressProps = {
    stats?: FlowComputation['partitions_stats'];
};

type FlowComputationPartitionStates = keyof Required<
    Required<FlowComputation>['partitions_stats']
>['count_by_state'];
const STATE_TO_THEME: Record<FlowComputationPartitionStates, ProgressTheme> = {
    completed: 'info',
    transient: 'warning',
    executing: 'success',
    interrupted: 'default',
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
        return {stack: addProgressStackSpacers(stack), history};
    }, [stats, count]);

    return (
        <div>
            <Progress className={block('progress')} stack={stack} size="xs" />
            <Flex style={{paddingTop: '8px'}} alignItems="baseline" gap={2}>
                <FlowCaption2>
                    {format.Number(count)}{' '}
                    <Text color="secondary" variant="inherit">
                        partitions
                    </Text>
                </FlowCaption2>
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
            {data.map(({value, type}, index) => {
                return <ComputationProgressHistoryItem key={index} value={value} type={type} />;
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
            <FlowCaption2>{value}</FlowCaption2>
        </Flex>
    );
}

function ComputationDetails({item}: Pick<ComputationProps, 'item'>) {
    const {cpu_usage_current: _cpu, memory_usage_current: _mem, ...rest} = item.meta?.metrics ?? {};
    return (
        <MetaTable
            className={block('details')}
            items={[
                Object.entries(rest).map(([key, value]) => {
                    const fmt = key.startsWith('memory_') ? format.Bytes : format.Number;
                    return {
                        key,
                        value: fmt(value, {digits: 2}),
                    };
                }),
            ]}
        />
    );
}
