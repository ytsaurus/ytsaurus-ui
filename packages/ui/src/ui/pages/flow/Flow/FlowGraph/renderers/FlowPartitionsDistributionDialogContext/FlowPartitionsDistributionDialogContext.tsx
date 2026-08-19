import {Flex, SegmentedRadioGroup, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import format from '../../../../../../common/hammer/format';
import {DialogWrapper} from '../../../../../../components/DialogWrapper/DialogWrapper';
import Loader from '../../../../../../components/Loader/Loader';
import {YTChartKitHistogram} from '../../../../../../components/YTChartKit';
import {FlowError} from '../../../../../../pages/flow/flow-components/FlowError/FlowError';
import {useFlowExecuteQuery} from '../../../../../../store/api/yt';
import {useSelector} from '../../../../../../store/redux-hooks';
import {selectFlowPipelinePath} from '../../../../../../store/selectors/flow/filters';
import './FlowPartitionsDistributionDialogContext.scss';
import i18n from './i18n';

const block = cn('yt-flow-partitions-distribution');

const METRICS = ['cpu_usage', 'memory_usage', 'messages_per_second', 'bytes_per_second'] as const;
type DistributionMetric = (typeof METRICS)[number];

// A meaningful full scale of a metric for a single partition. The histogram bar is never
// narrower than 10% of it, so negligible differences between partitions do not look like a skew.
const METRIC_FULL_SCALE: Record<DistributionMetric, number> = {
    cpu_usage: 1, // one cpu core
    memory_usage: 1024 ** 3, // 1 GB
    messages_per_second: 1000, // recommended limit for a single partition
    bytes_per_second: 1024 ** 2, // recommended limit for a single partition
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

    const {data, error, isLoading} = useFlowExecuteQuery<'describe-computation'>({
        parameters: {
            flow_command: 'describe-computation',
            pipeline_path,
        },
        body: {
            computation_id: computationId,
        },
    });

    const {values, allEqual} = React.useMemo(() => {
        const res = (data?.partitions?.map((partition) => partition[metric]) ?? []).filter(
            Number.isFinite,
        );
        return {values: res, allEqual: res.every((value) => value === res[0])};
    }, [data, metric]);

    if (isLoading) {
        return <Loader visible centered />;
    }

    if (error) {
        return <FlowError error={error} />;
    }

    return (
        <Flex direction="column" gap={3}>
            <Flex gap={4} alignItems="center">
                <SegmentedRadioGroup<DistributionMetric>
                    value={metric}
                    onUpdate={setMetric}
                    options={METRICS.map((value) => ({value, content: i18n(value)}))}
                />
                <Text color="secondary">
                    {i18n('context_partitions-count', {count: values.length})}
                </Text>
            </Flex>
            <div className={block('chart')}>
                {!values.length ? (
                    <Text color="secondary">{i18n('context_no-partitions')}</Text>
                ) : allEqual ? (
                    <Text color="secondary">
                        {i18n('context_all-values-equal', {
                            value: format.Number(values[0], {digits: 2}),
                        })}
                    </Text>
                ) : (
                    <YTChartKitHistogram
                        data={values}
                        xPlotLines={{average: data?.performance_metrics?.average?.[metric]}}
                        minBarWidth={METRIC_FULL_SCALE[metric] / 10}
                        seriesName={i18n('field_partitions')}
                        xAxisTitle={i18n(metric)}
                        yAxisTitle={i18n('field_partitions')}
                    />
                )}
            </div>
        </Flex>
    );
}
