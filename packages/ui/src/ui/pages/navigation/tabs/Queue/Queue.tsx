import React, {ComponentType, useEffect} from 'react';
import {connect, ConnectedProps} from 'react-redux';

import ErrorBlock from '../../../../components/Block/Block';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {QUEUE_MODE} from '../../../../constants/navigation/tabs/queue';
import {loadQueueStatus} from '../../../../store/actions/navigation/tabs/queue/status';
import type {RootState} from '../../../../store/reducers';
import {
    getFamily,
    getPartitionCount,
    getQueueMode,
    getWriteDataWeightRate,
    getWriteRowCountRate,
    getStatusError,
} from '../../../../store/selectors/navigation/tabs/queue';

import Meta from './Meta/Meta';
import Toolbar from './Toolbar/Toolbar';
import QueueMetrics from './views/QueueMetrics/QueueMetrics';
import Consumers from './views/Consumers/Consumers';
import ConsumersExtraControls from './views/Consumers/ConsumersExtraControls';
import Partitions from './views/Partitions/Partitions';
import PartitionsExtraControls from './views/Partitions/PartitionsExtraControls';
import UIFactory from '../../../../UIFactory';

const emptyView = {ExtraControls: () => null, View: () => null};

const views: Record<QUEUE_MODE, {ExtraControls: ComponentType; View: ComponentType}> = {
    [QUEUE_MODE.METRICS]: {ExtraControls: () => null, View: () => null},
    [QUEUE_MODE.PARTITIONS]: {ExtraControls: PartitionsExtraControls, View: Partitions},
    [QUEUE_MODE.CONSUMERS]: {ExtraControls: ConsumersExtraControls, View: Consumers},
};

function useViewByMode(mode: QUEUE_MODE) {
    const component = UIFactory.getComonentForQueueMetrics();
    if (component && mode === QUEUE_MODE.METRICS) {
        return {ExtraControls: () => null, View: QueueMetrics};
    }

    return views[mode] || emptyView;
}

const Queue: React.VFC<PropsFromRedux> = ({
    loadQueueStatus,
    family,
    partitionCount,
    writeDataWeightRate,
    writeRowCountRate,
    queueMode,
    statusError,
}) => {
    useEffect(() => {
        loadQueueStatus();
    }, []);

    const {ExtraControls, View} = useViewByMode(queueMode);

    if (statusError) {
        return <ErrorBlock error={statusError} topMargin="half" />;
    }

    return (
        <ErrorBoundary>
            <Meta
                family={family}
                partitionCount={partitionCount}
                writeDataWeightRate={writeDataWeightRate}
                writeRowCountRate={writeRowCountRate}
            />
            <WithStickyToolbar toolbar={<Toolbar extras={ExtraControls} />} content={<View />} />
        </ErrorBoundary>
    );
};

function mapStateToProps(state: RootState) {
    return {
        family: getFamily(state),
        partitionCount: getPartitionCount(state),
        writeDataWeightRate: getWriteDataWeightRate(state),
        writeRowCountRate: getWriteRowCountRate(state),
        queueMode: getQueueMode(state),
        statusError: getStatusError(state),
    };
}

const mapDispatchToProps = {
    loadQueueStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Queue);
