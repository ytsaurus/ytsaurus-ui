import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
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

type MetricSettings = {
    /** multiplier to convert the value to the unit displayed on charts */
    scale: number;
    /** width of a histogram bar in the displayed unit */
    barWidth: number;
    unit?: 'unit_cores' | 'unit_megabytes' | 'unit_kilobytes-per-second';
    /** describes how the value is measured */
    hint:
        | 'hint_cpu_usage'
        | 'hint_memory_usage'
        | 'hint_messages_per_second'
        | 'hint_bytes_per_second';
};

const METRIC_SETTINGS: Record<DistributionMetric, MetricSettings> = {
    cpu_usage: {scale: 1, barWidth: 0.1, unit: 'unit_cores', hint: 'hint_cpu_usage'},
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

    const {data, error, isLoading} = useFlowExecuteQuery<'describe-computation'>({
        parameters: {
            flow_command: 'describe-computation',
            pipeline_path,
        },
        body: {
            computation_id: computationId,
        },
    });

    const {scale, barWidth, unit, hint} = METRIC_SETTINGS[metric];

    const {items, stats} = React.useMemo(() => {
        const items = (data?.partitions ?? [])
            .filter((partition) => Number.isFinite(partition[metric]))
            .map((partition) => ({name: partition.partition_id, value: partition[metric] * scale}))
            .sort((l, r) => r.value - l.value);

        const stats = !items.length
            ? undefined
            : {
                  max: items[0].value,
                  min: items[items.length - 1].value,
                  average: items.reduce((acc, {value}) => acc + value, 0) / items.length,
              };

        return {items, stats};
    }, [data, metric, scale]);

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    const formatValue = (value: number) => {
        const res = format.NumberSmart(value, {significantDigits: 3});
        return unit === undefined ? res : `${res} ${i18n(unit)}`;
    };

    const valueTitle = unit === undefined ? i18n(metric) : `${i18n(metric)}, ${i18n(unit)}`;

    return (
        <Flex direction="column" gap={3}>
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
            </Flex>
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
        </Flex>
    );
}
