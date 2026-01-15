import {Flex, Progress, ProgressTheme, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import {FlowComputationType} from '../../../../../../shared/yt-types';
import format from '../../../../../common/hammer/format';
import Link from '../../../../../components/Link/Link';
import {FlowTab} from '../../../../../store/reducers/flow/filters';
import {useSelector} from '../../../../../store/redux-hooks';
import {getFlowPipelinePath} from '../../../../../store/selectors/flow/filters';
import {makeFlowLink} from '../../../../../utils/app-url';
import {addProgressStackSpacers} from '../../../../../utils/progress';
import {FlowGraphBlockItem} from '../FlowGraph';
import './Computation.scss';
import {
    FlowCaption1,
    FlowCaption2,
    FlowMessages,
    TextWithHighConsumption,
} from './FlowGraphRenderer';
import {FlowMeta} from './FlowMeta';

const block = cn('yt-flow-computation');

type ComputationProps = {
    className?: string;

    detailed?: boolean;

    item: Omit<FlowGraphBlockItem<'computation'>, 'is'>;
};

export function Computation({detailed, item, className}: ComputationProps) {
    const path = useSelector(getFlowPipelinePath);

    const {cpu_usage_10m, memory_usage_10m} = item.meta?.metrics ?? {};
    const {highlight_cpu_usage, hightlight_memory_usage} = item.meta ?? {};

    return (
        <div className={block(null, className)}>
            <Flex className={block('name')} gap={4} alignItems="baseline">
                <Flex grow={1} overflow="hidden">
                    <FlowCaption2>
                        <Link
                            routed
                            routedPreserveLocation
                            url={makeFlowLink({
                                path,
                                tab: FlowTab.COMPUTATIONS,
                                computation: item.name,
                            })}
                        >
                            {item.name}
                        </Link>
                    </FlowCaption2>
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
                                {format.NumberSmart(cpu_usage_10m, {
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
            {detailed && <FlowMessages data={item.meta.messages} />}
        </div>
    );
}

type ComputationProgressProps = {
    stats?: FlowComputationType['partitions_stats'];
};

type FlowComputationPartitionStates = keyof Required<
    Required<FlowComputationType>['partitions_stats']
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
