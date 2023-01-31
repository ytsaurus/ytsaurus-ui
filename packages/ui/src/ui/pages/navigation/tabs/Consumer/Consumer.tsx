import React, {ComponentType, useEffect} from 'react';
import {connect, ConnectedProps} from 'react-redux';

import ErrorBlock from '../../../../components/Block/Block';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {CONSUMER_MODE} from '../../../../constants/navigation/tabs/consumer';
import {loadConsumerStatus} from '../../../../store/actions/navigation/tabs/consumer/status';
import type {RootState} from '../../../../store/reducers';
import {
    getConsumerMode,
    getOwner,
    getPartitionCount,
    getReadDataWeightRate,
    getReadRowCountRate,
    getTargetQueue,
    getVital,
    getStatusError,
} from '../../../../store/selectors/navigation/tabs/consumer';

import Meta from './Meta/Meta';
import Toolbar from './Toolbar/Toolbar';
import ConsumerMetrics from './views/ConsumerMetrics/ConsumerMetrics';
import Partitions from './views/Partitions/Partitions';
import PartitionsExtraControls from './views/Partitions/PartitionsExtraControls';
import UIFactory from '../../../../UIFactory';

const views: Record<CONSUMER_MODE, {ExtraControls: ComponentType; View: ComponentType}> = {
    [CONSUMER_MODE.METRICS]: {ExtraControls: () => null, View: ConsumerMetrics},
    [CONSUMER_MODE.PARTITIONS]: {ExtraControls: PartitionsExtraControls, View: Partitions},
};

const emptyView: {ExtraControls: ComponentType; View: ComponentType} = {
    ExtraControls: () => null,
    View: () => null,
};

function useViewByMode(mode: CONSUMER_MODE): {ExtraControls: ComponentType; View: ComponentType} {
    const component = UIFactory.getComponentForConsumerMetrics();
    if (!component) {
        return emptyView;
    }

    return views[mode] || emptyView;
}

const Consumer: React.VFC<PropsFromRedux> = ({
    loadConsumerStatus,
    targetQueue,
    owner,
    vital,
    partitionCount,
    readDataWeightRate,
    readRowCountRate,
    consumerMode,
    statusError,
}) => {
    useEffect(() => {
        loadConsumerStatus();
    }, []);

    const {ExtraControls, View} = useViewByMode(consumerMode);

    if (statusError) {
        return <ErrorBlock error={statusError} topMargin="half" />;
    }

    return (
        <ErrorBoundary>
            <Meta
                targetQueue={targetQueue}
                owner={owner}
                vital={vital}
                partitionCount={partitionCount}
                readDataWeightRate={readDataWeightRate}
                readRowCountRate={readRowCountRate}
            />
            <WithStickyToolbar toolbar={<Toolbar extras={ExtraControls} />} content={<View />} />
        </ErrorBoundary>
    );
};

function mapStateToProps(state: RootState) {
    return {
        targetQueue: getTargetQueue(state),
        owner: getOwner(state),
        vital: getVital(state),
        partitionCount: getPartitionCount(state),
        readDataWeightRate: getReadDataWeightRate(state),
        readRowCountRate: getReadRowCountRate(state),
        consumerMode: getConsumerMode(state),
        statusError: getStatusError(state),
    };
}

const mapDispatchToProps = {
    loadConsumerStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Consumer);
