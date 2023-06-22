import React from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import ypath from '../../../../../../common/thor/ypath';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import {Checkbox} from '@gravity-ui/uikit';

import format from '../../../../../../common/hammer/format';

import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';

import {operationProps} from '../../details/Runtime/Runtime';
import {getTheme} from '../../../../../../store/selectors/global';

import WithStickyToolbar from '../../../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {hasTaskHistograms} from '../../../../../../utils/operations/jobs';
import {getOperationDetailsLoadingStatus} from '../../../../../../store/selectors/operations/operation';
import {useAppRumMeasureStart} from '../../../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../../utils/utils';
import {useRumMeasureStop} from '../../../../../../rum/RumUiContext';
import {RootState} from '../../../../../../store/reducers';
import YTHistogram, {
    YTHistogramProps,
    YTHistorgramData,
    calculateFormatSettings,
} from '../../../../../../components/YTHistogram/YTHistogram';

import './JobSizes.scss';

const block = cn('operation-detail-job-sizes');

type ReduxProps = ConnectedProps<typeof connector>;

interface State {
    formatSettings?: {digits: number};
    data?: YTHistorgramData;
    showEstimated: boolean;
}

class JobSizes extends React.Component<ReduxProps, State> {
    static propTypes = {
        operation: operationProps.isRequired,
        chartKitTheme: PropTypes.string.isRequired,
    };

    static getDerivedStateFromProps(props: ReduxProps) {
        const progress = ypath.getValue(props.operation, '/@progress');
        const data = progress && ypath.getValue(progress, '/partition_size_histogram');

        return {
            formatSettings: calculateFormatSettings(data, format.Bytes),
            data,
        };
    }

    state: State = {
        showEstimated: false,
    };

    render() {
        return (
            <WithStickyToolbar
                content={this.renderContent()}
                toolbar={
                    <Toolbar
                        itemsToWrap={[
                            {
                                name: 'showEstimated',
                                node: (
                                    <Checkbox
                                        size="l"
                                        onUpdate={this.toggleEstimated}
                                        checked={this.state.showEstimated}
                                    >
                                        Show estimated
                                    </Checkbox>
                                ),
                            },
                        ]}
                    />
                }
            />
        );
    }

    prepareJobSizes() {
        const {operation} = this.props;
        const progress = ypath.getValue(operation, '/@progress');

        return progress
            ? {
                  estimatedJobSizeHistogram: ypath.getValue(
                      progress,
                      '/estimated_input_data_size_histogram',
                  ),
                  jobSizeHistogram: ypath.getValue(progress, '/input_data_size_histogram'),
              }
            : {};
    }

    renderChart(data: YTHistorgramData, title: string) {
        if (!data) {
            return null;
        }

        return (
            <div className={block('chart-section')}>
                <div className="elements-heading elements-heading_size_m">{title}</div>
                <YTHistogram
                    className={block('charts')}
                    data={data}
                    yLabel={'jobs count'}
                    xLabel={'job input data weight'}
                    xFormat={this.formatX}
                    yMin={0.5}
                    yLogarithmic
                    renderTooltip={this.renderTooltip}
                />
            </div>
        );
    }

    formatX = (v?: number | string | null) => {
        const {formatSettings} = this.state;
        return format.Bytes(v, formatSettings) as string;
    };

    renderTooltip: YTHistogramProps['renderTooltip'] = (y, x0, x1) => {
        return `<b>${y}</b> jobs have estimated input job size from <b>${x0}</b> to <b>${x1}</b>`;
    };

    renderPerTaskCharts(tasks: any) {
        const {showEstimated} = this.state;
        return _.map(
            tasks,
            ({task_name, estimated_input_data_weight_histogram, input_data_weight_histogram}) => {
                return (
                    <div className={block('task-cell', {'per-task': true})} key={task_name}>
                        {this.renderChart(
                            input_data_weight_histogram,
                            `Task "${task_name}" actual data weight`,
                        )}
                        {showEstimated &&
                            this.renderChart(
                                estimated_input_data_weight_histogram,
                                `Task "${task_name}" estimated data weight`,
                            )}
                    </div>
                );
            },
        );
    }

    renderCommon() {
        const {showEstimated} = this.state;
        const {jobSizeHistogram, estimatedJobSizeHistogram} = this.prepareJobSizes();
        return (
            <div className={block('task-cell')}>
                {this.renderChart(jobSizeHistogram, 'Input')}
                {showEstimated && this.renderChart(estimatedJobSizeHistogram, 'Estimated input')}
            </div>
        );
    }

    renderContent() {
        const {operation} = this.props;
        const tasks = ypath.getValue(this.props.operation, '/@progress/tasks');
        return (
            <ErrorBoundary>
                <div className={block()}>
                    {hasTaskHistograms(operation)
                        ? this.renderPerTaskCharts(tasks)
                        : this.renderCommon()}
                </div>
            </ErrorBoundary>
        );
    }

    toggleEstimated = () => {
        const {showEstimated} = this.state;
        this.setState({showEstimated: !showEstimated});
    };
}

const mapStateToProps = (state: RootState) => {
    const operation = state.operations.detail.operation;
    const chartKitTheme = getTheme(state);

    return {operation, chartKitTheme};
};

const connector = connect(mapStateToProps);

const JobSizesConnected = connector(JobSizes);

export default function JobSizesWithRum() {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_JOB_SIZES,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_JOB_SIZES,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <JobSizesConnected />;
}
