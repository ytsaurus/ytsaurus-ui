import React, {ComponentType, useEffect} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';

import {Alerts} from '../../../../components/Alerts/Alerts';
import {YTErrorBlock} from '../../../../components/Block/Block';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {QUEUE_MODE} from '../../../../constants/navigation/tabs/queue';
import {loadQueueStatus} from '../../../../store/actions/navigation/tabs/queue/status';
import type {RootState} from '../../../../store/reducers';
import {
    getFamily,
    getPartitionCount,
    getQueueMode,
    getQueueStatusDataAlerts,
    getStatusError,
    getWriteDataWeightRate,
    getWriteRowCountRate,
} from '../../../../store/selectors/navigation/tabs/queue';

import Meta from './Meta/Meta';
import QueueToolbar from './Toolbar/Toolbar';
import QueueMetrics from './views/QueueMetrics/QueueMetrics';
import Consumers from './views/Consumers/Consumers';
import ConsumersExtraControls from './views/Consumers/ConsumersExtraControls';
import Partitions from './views/Partitions/Partitions';
import PartitionsExtraControls from './views/Partitions/PartitionsExtraControls';
import UIFactory from '../../../../UIFactory';
import {Exports} from './views/Exports/Exports';
import {ExportsExtraControls} from './views/Exports/ExportsExtraControls';

const emptyView = {ExtraControls: () => null, View: () => null};

const views: Record<QUEUE_MODE, {ExtraControls: ComponentType; View: ComponentType}> = {
    [QUEUE_MODE.METRICS]: {ExtraControls: () => null, View: () => null},
    [QUEUE_MODE.PARTITIONS]: {ExtraControls: PartitionsExtraControls, View: Partitions},
    [QUEUE_MODE.CONSUMERS]: {ExtraControls: ConsumersExtraControls, View: Consumers},
    [QUEUE_MODE.EXPORTS]: {ExtraControls: ExportsExtraControls, View: Exports},
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

    const items = useSelector(getQueueStatusDataAlerts);

    if (statusError) {
        return <YTErrorBlock error={statusError} topMargin="none" />;
    }

    return (
        <ErrorBoundary>
            <Alerts items={items} />
            <Meta
                family={family}
                partitionCount={partitionCount}
                writeDataWeightRate={writeDataWeightRate}
                writeRowCountRate={writeRowCountRate}
            />
            <WithStickyToolbar
                toolbar={
                    <Toolbar
                        itemsToWrap={[
                            {node: <QueueToolbar extras={ExtraControls} />, growable: true},
                        ]}
                    />
                }
                content={<View />}
            />
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
