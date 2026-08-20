import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import {Tooltip} from '@ytsaurus/components';
import cn from 'bem-cn-lite';
import React from 'react';
import {
    type FlowComputationDetailsType,
    type FlowViewNodePerformanceMetrics,
} from '../../../../../../../shared/yt-types';
import format from '../../../../../../common/hammer/format';
import {DialogWrapper} from '../../../../../../components/DialogWrapper/DialogWrapper';
import Loader from '../../../../../../components/Loader/Loader';
import {YTChartKitBars, YTChartKitHistogram} from '../../../../../../components/YTChartKit';
import {FlowError} from '../../../../../../pages/flow/flow-components/FlowError/FlowError';
import {useFlowExecuteQuery} from '../../../../../../store/api/yt';
import {useSelector} from '../../../../../../store/redux-hooks';
import {selectFlowPipelinePath} from '../../../../../../store/selectors/flow/filters';
import './FlowPartitionsDistributionDialogContext.scss';
import i18n from './i18n';

const block = cn('yt-flow-partitions-distribution');

const METRICS = ['cpu_usage', 'memory_usage', 'messages_per_second', 'bytes_per_second'] as const;
type DistributionMetric = (typeof METRICS)[number];

const VIEWS = ['by-partition', 'distribution'] as const;
type DistributionView = (typeof VIEWS)[number];

const WINDOWS = ['now', '30s', '10m'] as const;
type DistributionWindow = (typeof WINDOWS)[number];

//! Fields of the flow view job metrics from the most detailed one to the most smoothed one.
//! Only cpu and memory are measured over several windows, see TNodePerformanceMetrics.
const WINDOW_FIELDS: Record<
    'cpu_usage' | 'memory_usage',
    Record<DistributionWindow, Array<keyof FlowViewNodePerformanceMetrics>>
> = {
    cpu_usage: {
        now: ['cpu_usage_current', 'cpu_usage_30s', 'cpu_usage_10m'],
        '30s': ['cpu_usage_30s', 'cpu_usage_10m'],
        '10m': ['cpu_usage_10m'],
    },
    memory_usage: {
        now: ['memory_usage_current', 'memory_usage_30s', 'memory_usage_10m'],
        '30s': ['memory_usage_30s', 'memory_usage_10m'],
        '10m': ['memory_usage_10m'],
    },
};

type MetricSettings = {
    /** multiplier to convert the value to the unit displayed on charts */
    scale: number;
    /** width of a histogram bar in the displayed unit */
    barWidth: number;
    unit?: 'unit_vcpu' | 'unit_megabytes' | 'unit_kilobytes-per-second';
    /** describes how the value is measured */
    hint:
        | 'hint_cpu_usage'
        | 'hint_memory_usage'
        | 'hint_messages_per_second'
        | 'hint_bytes_per_second';
};

const METRIC_SETTINGS: Record<DistributionMetric, MetricSettings> = {
    cpu_usage: {scale: 1, barWidth: 0.1, unit: 'unit_vcpu', hint: 'hint_cpu_usage'},
    memory_usage: {
        scale: 1 / 1024 ** 2,
        barWidth: 100,
        unit: 'unit_megabytes',
        hint: 'hint_memory_usage',
    },
    messages_per_second: {scale: 1, barWidth: 100, hint: 'hint_messages_per_second'},
    bytes_per_second: {
        scale: 1 / 1024,
        barWidth: 100,
        unit: 'unit_kilobytes-per-second',
        hint: 'hint_bytes_per_second',
    },
};

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
                        <FlowPartitionsDistributionContent computationId={computationId} />
                    </DialogWrapper.Body>
                </DialogWrapper>
            )}
        </FlowPartitionsDistributionDialogCtx.Provider>
    );
}

function FlowPartitionsDistributionContent({computationId}: {computationId: string}) {
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

    const windowFields =
        metric === 'cpu_usage' || metric === 'memory_usage'
            ? WINDOW_FIELDS[metric][metricWindow]
            : undefined;
    // The values of describe-computation are the most smoothed ones, other windows come from the flow view.
    const flowViewFields = windowFields?.length === 1 ? undefined : windowFields;

    const partitions = data?.partitions;

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    const controls = (
        <Flex gap={4} alignItems="center" wrap>
            <SegmentedRadioGroup<DistributionMetric>
                value={metric}
                onUpdate={setMetric}
                options={METRICS.map((value) => ({value, content: i18n(value)}))}
            />
            <SegmentedRadioGroup<DistributionView>
                value={view}
                onUpdate={setView}
                options={VIEWS.map((value) => ({value, content: i18n(value)}))}
            />
            <Tooltip content={i18n(windowFields ? 'context_window' : 'context_single-window')}>
                <SegmentedRadioGroup<DistributionWindow>
                    value={metricWindow}
                    onUpdate={setMetricWindow}
                    disabled={!windowFields}
                    options={WINDOWS.map((value) => ({value, content: i18n(value)}))}
                />
            </Tooltip>
        </Flex>
    );

    return (
        <Flex direction="column" gap={3}>
            {controls}
            {flowViewFields ? (
                <FlowViewPartitionsCharts
                    pipeline_path={pipeline_path}
                    partitions={partitions}
                    fields={flowViewFields}
                    metric={metric}
                    view={view}
                />
            ) : (
                <PartitionsCharts
                    items={makeItems(partitions, (partition) => partition[metric], metric)}
                    metric={metric}
                    view={view}
                />
            )}
        </Flex>
    );
}

type PartitionsProps = {
    metric: DistributionMetric;
    view: DistributionView;
};

//! Loads the metrics of the recent windows, describe-computation provides the most smoothed ones only.
function FlowViewPartitionsCharts({
    pipeline_path,
    partitions,
    fields,
    ...rest
}: PartitionsProps & {
    pipeline_path: string;
    partitions?: FlowComputationDetailsType['partitions'];
    fields: Array<keyof FlowViewNodePerformanceMetrics>;
}) {
    const {data, error, isLoading} = useFlowExecuteQuery<'get-flow-view'>({
        parameters: {
            flow_command: 'get-flow-view',
            pipeline_path,
        },
        body: {path: '/feedback/partition_job_statuses', cache: true},
    });

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

function PartitionsCharts({items, metric, view}: PartitionsProps & {items: Array<PartitionValue>}) {
    const {barWidth, unit, hint} = METRIC_SETTINGS[metric];

    const stats = React.useMemo(() => {
        return !items.length
            ? undefined
            : {
                  max: items[0].value,
                  min: items[items.length - 1].value,
                  average: items.reduce((acc, {value}) => acc + value, 0) / items.length,
              };
    }, [items]);

    const formatValue = (value: number) => {
        const res = format.NumberSmart(value, {significantDigits: 3});
        return unit === undefined ? res : `${res} ${i18n(unit)}`;
    };

    const valueTitle = unit === undefined ? i18n(metric) : `${i18n(metric)}, ${i18n(unit)}`;

    return (
        <React.Fragment>
            <Text color="secondary">
                {i18n('context_partitions-count', {count: items.length})}
                {stats &&
                    ` · ${i18n('field_min')} ${formatValue(stats.min)}` +
                        ` · ${i18n('field_average')} ${formatValue(stats.average)}` +
                        ` · ${i18n('field_max')} ${formatValue(stats.max)}`}
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
                        xAxisTitle={i18n('axis_partitions')}
                        yAxisTitle={valueTitle}
                    />
                ) : (
                    <YTChartKitHistogram
                        data={items.map(({value}) => value)}
                        barWidth={barWidth}
                        seriesName={i18n('field_partitions')}
                        xAxisTitle={valueTitle}
                        yAxisTitle={i18n('field_partitions')}
                    />
                )}
            </div>
        </React.Fragment>
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
