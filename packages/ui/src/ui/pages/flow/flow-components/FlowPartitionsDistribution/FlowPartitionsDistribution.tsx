import {ChartColumn} from '@gravity-ui/icons';
import {Button, Flex, Icon, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {Tooltip} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import minBy_ from 'lodash/minBy';
import React from 'react';
import {
    type FlowComputationDetailsType,
    type FlowViewNodePerformanceMetrics,
} from '../../../../../shared/yt-types';
import {FlowTab} from '../../../../store/reducers/flow/filters';
import {makeFlowLink} from '../../../../utils/app-url';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {Yson} from '../../../../components/Yson/Yson';
import format from '../../../../common/hammer/format';
import {DialogWrapper} from '../../../../components/DialogWrapper/DialogWrapper';
import Loader from '../../../../components/Loader/Loader';
import {YTChartKitBars, YTChartKitHistogram} from '../../../../components/YTChartKit';
import {FlowError} from '../FlowError/FlowError';
import {useFlowExecuteQuery} from '../../../../store/api/yt';
import {useSelector} from '../../../../store/redux-hooks';
import {selectFlowPipelinePath} from '../../../../store/selectors/flow/filters';
import './FlowPartitionsDistribution.scss';
import i18n from './i18n';

const block = cn('yt-flow-partitions-distribution');

const METRICS = ['cpu_usage', 'memory_usage', 'messages_per_second', 'bytes_per_second'] as const;
type DistributionMetric = (typeof METRICS)[number];

const VIEWS = ['by-partition', 'distribution', 'heavy-hitters'] as const;
type DistributionView = (typeof VIEWS)[number];

// Only cpu and memory are measured over several windows, see TNodePerformanceMetrics.
type WindowedMetric = 'cpu_usage' | 'memory_usage';

const WINDOWS = ['now', '30s', '10m'] as const;
type DistributionWindow = (typeof WINDOWS)[number];

// Fields of the flow view job metrics from the most detailed one to the most smoothed one.
// The 10m window is not here, it is provided by describe-computation.
const FLOW_VIEW_FIELDS: Record<
    WindowedMetric,
    Record<Exclude<DistributionWindow, '10m'>, Array<keyof FlowViewNodePerformanceMetrics>>
> = {
    cpu_usage: {
        now: ['cpu_usage_current', 'cpu_usage_30s', 'cpu_usage_10m'],
        '30s': ['cpu_usage_30s', 'cpu_usage_10m'],
    },
    memory_usage: {
        now: ['memory_usage_current', 'memory_usage_30s', 'memory_usage_10m'],
        '30s': ['memory_usage_30s', 'memory_usage_10m'],
    },
};

type MetricSettings = {
    field:
        | 'field_cpu-usage'
        | 'field_memory-usage'
        | 'field_messages-per-second'
        | 'field_bytes-per-second';
    /** describes how the value is measured */
    hint:
        | 'context_cpu-usage'
        | 'context_memory-usage'
        | 'context_messages-per-second'
        | 'context_bytes-per-second';
    unit?: 'unit_vcpu' | 'unit_megabytes' | 'unit_kilobytes-per-second';
    /** multiplier to convert the value to the unit displayed on charts */
    scale: number;
    /** width of a histogram bar in the displayed unit */
    barWidth: number;
};

const METRIC_SETTINGS: Record<DistributionMetric, MetricSettings> = {
    cpu_usage: {
        field: 'field_cpu-usage',
        hint: 'context_cpu-usage',
        unit: 'unit_vcpu',
        scale: 1,
        barWidth: 0.1,
    },
    memory_usage: {
        field: 'field_memory-usage',
        hint: 'context_memory-usage',
        unit: 'unit_megabytes',
        scale: 1 / 1024 ** 2,
        barWidth: 100,
    },
    messages_per_second: {
        field: 'field_messages-per-second',
        hint: 'context_messages-per-second',
        scale: 1,
        barWidth: 100,
    },
    bytes_per_second: {
        field: 'field_bytes-per-second',
        hint: 'context_bytes-per-second',
        unit: 'unit_kilobytes-per-second',
        scale: 1 / 1024,
        barWidth: 100,
    },
};

function isWindowedMetric(metric: DistributionMetric): metric is WindowedMetric {
    return metric === 'cpu_usage' || metric === 'memory_usage';
}

type PartitionValue = {name: string; value: number};

type FlowPartitionsDistributionDialogContextValue = {
    computationId?: string;
    setVisibleDistribution: (computationId?: string) => void;
};

const FlowPartitionsDistributionDialogCtx =
    React.createContext<FlowPartitionsDistributionDialogContextValue>({
        computationId: undefined,
        setVisibleDistribution: () => {},
    });

export function useFlowPartitionsDistributionDialogContext() {
    const {setVisibleDistribution} = React.useContext(FlowPartitionsDistributionDialogCtx);
    return {setVisibleDistribution};
}

export function FlowPartitionsDistributionButton({computationId}: {computationId: string}) {
    const {setVisibleDistribution} = useFlowPartitionsDistributionDialogContext();
    return (
        <Tooltip content={i18n('action_partitions-distribution')}>
            <Button
                view="flat-info"
                size="xs"
                onClick={() => setVisibleDistribution(computationId)}
                extraProps={{'aria-label': i18n('action_partitions-distribution')}}
            >
                <Icon data={ChartColumn} size={12} />
            </Button>
        </Tooltip>
    );
}

export function FlowPartitionsDistributionDialogContext({children}: {children: React.ReactNode}) {
    const [computationId, setVisibleDistribution] = React.useState<string>();
    return (
        <FlowPartitionsDistributionDialogCtx.Provider
            value={{computationId, setVisibleDistribution}}
        >
            {children}
            {computationId && (
                <DialogWrapper
                    className={block('dialog')}
                    open={true}
                    onClose={() => setVisibleDistribution(undefined)}
                >
                    <DialogWrapper.Header
                        caption={i18n('title_distribution', {computation: computationId})}
                    />
                    <DialogWrapper.Body className={block('body')}>
                        <FlowPartitionsDistribution computationId={computationId} />
                    </DialogWrapper.Body>
                </DialogWrapper>
            )}
        </FlowPartitionsDistributionDialogCtx.Provider>
    );
}

export function FlowPartitionsDistribution({computationId}: {computationId: string}) {
    const pipeline_path = useSelector(selectFlowPipelinePath);
    const [metric, setMetric] = React.useState<DistributionMetric>('cpu_usage');
    const [view, setView] = React.useState<DistributionView>('by-partition');
    const [metricWindow, setMetricWindow] = React.useState<DistributionWindow>('10m');

    const {data, error, isLoading} = useFlowExecuteQuery<'describe-computation'>({
        parameters: {
            flow_command: 'describe-computation',
            pipeline_path,
        },
        body: {
            computation_id: computationId,
        },
    });

    const windowed = isWindowedMetric(metric);
    const flowViewFields =
        windowed && metricWindow !== '10m' ? FLOW_VIEW_FIELDS[metric][metricWindow] : undefined;

    const partitions = data?.partitions;
    const items = React.useMemo(() => {
        return makeItems(partitions, (partition) => partition[metric], metric);
    }, [partitions, metric]);

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    const heavyHitters = view === 'heavy-hitters';

    return (
        <Flex direction="column" gap={3}>
            <Flex gap={4} alignItems="center" wrap>
                <SegmentedRadioGroup<DistributionView>
                    value={view}
                    onUpdate={setView}
                    options={VIEWS.map((value) => ({value, content: i18n(`value_${value}`)}))}
                />
                {!heavyHitters && (
                    <SegmentedRadioGroup<DistributionMetric>
                        value={metric}
                        onUpdate={setMetric}
                        options={METRICS.map((value) => ({
                            value,
                            content: i18n(METRIC_SETTINGS[value].field),
                        }))}
                    />
                )}
                {!heavyHitters && (
                    <Tooltip content={i18n(windowed ? 'context_window' : 'context_single-window')}>
                        <SegmentedRadioGroup<DistributionWindow>
                            value={metricWindow}
                            onUpdate={setMetricWindow}
                            disabled={!windowed}
                            options={WINDOWS.map((value) => ({
                                value,
                                content: i18n(`value_${value}`),
                            }))}
                        />
                    </Tooltip>
                )}
            </Flex>
            {heavyHitters ? (
                <FlowViewHeavyHitters
                    pipeline_path={pipeline_path}
                    computationId={computationId}
                    partitions={partitions}
                />
            ) : flowViewFields ? (
                <FlowViewPartitionsCharts
                    pipeline_path={pipeline_path}
                    computationId={computationId}
                    partitions={partitions}
                    fields={flowViewFields}
                    metric={metric}
                    view={view}
                />
            ) : (
                <PartitionsCharts
                    items={items}
                    computationId={computationId}
                    metric={metric}
                    view={view}
                />
            )}
        </Flex>
    );
}

type PartitionsProps = {
    computationId: string;
    metric: DistributionMetric;
    view: DistributionView;
};

type FlowViewProps = {
    pipeline_path: string;
    partitions?: FlowComputationDetailsType['partitions'];
};

function useFlowViewJobStatuses(pipeline_path: string) {
    return useFlowExecuteQuery<'get-flow-view'>({
        parameters: {
            flow_command: 'get-flow-view',
            pipeline_path,
        },
        body: {path: '/feedback/partition_job_statuses', cache: true},
    });
}

// Loads the metrics of the recent windows, describe-computation provides the most smoothed ones only.
function FlowViewPartitionsCharts({
    pipeline_path,
    partitions,
    fields,
    ...rest
}: PartitionsProps &
    FlowViewProps & {
        fields: Array<keyof FlowViewNodePerformanceMetrics>;
    }) {
    const {data, error, isLoading} = useFlowViewJobStatuses(pipeline_path);

    const items = React.useMemo(() => {
        return makeItems(
            partitions,
            (partition) => {
                const metrics =
                    data?.[partition.partition_id]?.current_job_status?.performance_metrics;
                const field = fields.find((key) => Number.isFinite(metrics?.[key]));
                return field === undefined ? undefined : metrics?.[field];
            },
            rest.metric,
        );
    }, [data, fields, partitions, rest.metric]);

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    return <PartitionsCharts items={items} {...rest} />;
}

function PartitionsCharts({
    items,
    computationId,
    metric,
    view,
}: PartitionsProps & {items: Array<PartitionValue>}) {
    const {field, hint, unit, barWidth} = METRIC_SETTINGS[metric];

    const stats = React.useMemo(() => {
        if (!items.length) {
            return undefined;
        }
        const sum = items.reduce((acc, {value}) => acc + value, 0);
        const average = sum / items.length;
        return {
            max: items[0],
            min: items[items.length - 1],
            average: {
                value: average,
                name: minBy_(items, ({value}) => Math.abs(value - average))?.name ?? items[0].name,
            },
        };
    }, [items]);

    const formatValue = (value: number) => {
        const res = format.NumberSmart(value, {significantDigits: 3});
        return unit === undefined ? res : `${res} ${i18n(unit)}`;
    };

    const valueTitle = unit === undefined ? i18n(field) : `${i18n(field)}, ${i18n(unit)}`;

    return (
        <React.Fragment>
            <Text color="secondary">
                {i18n('context_partitions-count', {count: items.length})}
                {stats &&
                    (['min', 'average', 'max'] as const).map((key) => (
                        <React.Fragment key={key}>
                            {` · ${i18n(`field_${key}`)} `}
                            <PartitionLink
                                computationId={computationId}
                                partitionId={stats[key].name}
                            >
                                {formatValue(stats[key].value)}
                            </PartitionLink>
                        </React.Fragment>
                    ))}
            </Text>
            <Text variant="caption-2" color="secondary">
                {i18n(hint)}
            </Text>
            <div className={block('chart')}>
                {!items.length ? (
                    <Text color="secondary">{i18n('context_no-partitions')}</Text>
                ) : view === 'by-partition' ? (
                    <YTChartKitBars
                        data={items}
                        xAxisTitle={i18n('field_partitions-sorted')}
                        yAxisTitle={valueTitle}
                    />
                ) : (
                    <YTChartKitHistogram
                        data={items.map(({value}) => value)}
                        barWidth={barWidth}
                        maxBarCount={50}
                        seriesName={i18n('field_partitions')}
                        yAxisMin={0}
                        xAxisTitle={valueTitle}
                        yAxisTitle={i18n('field_partitions')}
                    />
                )}
            </div>
        </React.Fragment>
    );
}

// Keys that take a noticeable part of the input of their partition. More partitions cannot split
// such a key, so a dominating key requires a change of the grouping key of the pipeline.
function FlowViewHeavyHitters({
    pipeline_path,
    computationId,
    partitions,
}: FlowViewProps & {computationId: string}) {
    const {data, error, isLoading} = useFlowViewJobStatuses(pipeline_path);

    const items = React.useMemo(() => {
        const res = (partitions ?? []).flatMap((partition) => {
            const metrics = data?.[partition.partition_id]?.current_job_status?.input_metrics;
            const messagesPerSecond = metrics?.global?.messages_per_second ?? 0;
            return (metrics?.global?.heavy_hitters ?? []).map(([ratio, key]) => ({
                key,
                ratio,
                messagesPerSecond: ratio * messagesPerSecond,
                partitionId: partition.partition_id,
            }));
        });
        return res.sort((l, r) => r.messagesPerSecond - l.messagesPerSecond);
    }, [data, partitions]);

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    if (!items.length) {
        return <Text color="secondary">{i18n('context_no-heavy-hitters')}</Text>;
    }

    return (
        <Flex direction="column" gap={2}>
            <Text variant="caption-2" color="secondary">
                {i18n('context_heavy-hitters')}
            </Text>
            {items.map(({key, ratio, messagesPerSecond, partitionId}, index) => (
                <Flex key={index} gap={4} alignItems="center" wrap>
                    <Yson value={key} inline />
                    <Text color="secondary">
                        {`${format.Percent(ratio * 100)} · ${format.Number(messagesPerSecond, {
                            digits: 2,
                        })} ${i18n('unit_messages-per-second')}`}
                    </Text>
                    <PartitionLink computationId={computationId} partitionId={partitionId}>
                        {partitionId}
                    </PartitionLink>
                </Flex>
            ))}
        </Flex>
    );
}

function PartitionLink({
    computationId,
    partitionId,
    children,
}: {
    computationId: string;
    partitionId: string;
    children: React.ReactNode;
}) {
    const path = useSelector(selectFlowPipelinePath);
    const {setVisibleDistribution} = useFlowPartitionsDistributionDialogContext();
    return (
        <RoutedLink
            href={makeFlowLink({
                path,
                tab: FlowTab.COMPUTATIONS,
                computation: computationId,
                partitionIdFilter: partitionId,
            })}
            onClick={() => setVisibleDistribution(undefined)}
        >
            {children}
        </RoutedLink>
    );
}

function makeItems(
    partitions: FlowComputationDetailsType['partitions'] | undefined,
    getValue: (partition: FlowComputationDetailsType['partitions'][number]) => number | undefined,
    metric: DistributionMetric,
) {
    const {scale} = METRIC_SETTINGS[metric];
    return (partitions ?? [])
        .map((partition) => ({name: partition.partition_id, value: getValue(partition)}))
        .filter((item): item is PartitionValue => Number.isFinite(item.value))
        .map(({name, value}) => ({name, value: value * scale}))
        .sort((l, r) => r.value - l.value);
}
