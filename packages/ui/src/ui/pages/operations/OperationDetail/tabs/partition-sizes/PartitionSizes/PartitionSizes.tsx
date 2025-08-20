import React from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import ypath from '../../../../../../common/thor/ypath';
import cn from 'bem-cn-lite';

import format from '../../../../../../common/hammer/format';

import ErrorBoundary from '../../../../../../components/ErrorBoundary/ErrorBoundary';

import {getTheme} from '../../../../../../store/selectors/global';

import {getOperationDetailsLoadingStatus} from '../../../../../../store/selectors/operations/operation';
import {useAppRumMeasureStart} from '../../../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../../../rum/rum-measure-types';
import {isFinalLoadingStatus} from '../../../../../../utils/utils';
import {useRumMeasureStop} from '../../../../../../rum/RumUiContext';
import YTHistogram, {
    YTHistogramProps,
    YTHistorgramData,
    calculateFormatSettings,
} from '../../../../../../components/YTHistogram/YTHistogram';
import {RootState} from '../../../../../../store/reducers';

import './PartitionSizes.scss';

const block = cn('operation-detail-partition-sizes');

type ReduxProps = ConnectedProps<typeof connector>;

interface State {
    formatSettings?: {digits: number};
    data?: YTHistorgramData;
}

class PartitionSizes extends React.Component<ReduxProps, State> {
    static propTypes = {
        operation: PropTypes.object.isRequired,
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

    state: State = {};

    render() {
        const {data} = this.state;
        if (!data) {
            return null;
        }

        return (
            <ErrorBoundary>
                <div className={block()}>
                    <YTHistogram
                        className={block('charts')}
                        data={data}
                        yLabel={'partition count'}
                        xLabel={'partition data weight'}
                        xFormat={this.formatX}
                        yMin={0.5}
                        yLogarithmic
                        renderTooltip={this.renderTooltip}
                    />
                </div>
            </ErrorBoundary>
        );
    }

    formatX = (v?: number | string | null) => {
        const {formatSettings} = this.state;
        return format.Bytes(v, formatSettings) as string;
    };

    renderTooltip: YTHistogramProps['renderTooltip'] = (y, x0, x1) => {
        return `<b>${y}</b> jobs have estimated input job size from ${x0} to ${x1}`;
    };
}

const mapStateToProps = (state: RootState) => {
    const operation = state.operations.detail.operation;
    const chartKitTheme = getTheme(state);

    return {operation, chartKitTheme};
};

const connector = connect(mapStateToProps);

const PartitionSizesConnected = connector(PartitionSizes);

export default function PartitionSizesWithRum() {
    const loadState = useSelector(getOperationDetailsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.OPERATION_TAB_PARTITION_SIZES,
        additionalStartType: RumMeasureTypes.OPERATION,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.OPERATION_TAB_PARTITION_SIZES,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <PartitionSizesConnected />;
}
