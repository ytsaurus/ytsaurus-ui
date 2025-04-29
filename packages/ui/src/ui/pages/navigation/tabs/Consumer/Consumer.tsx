import React, {ComponentType, useEffect} from 'react';
import {ConnectedProps, connect} from 'react-redux';

import {YTErrorBlock} from '../../../../components/Block/Block';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {CONSUMER_MODE} from '../../../../constants/navigation/tabs/consumer';
import {loadConsumerStatus} from '../../../../store/actions/navigation/tabs/consumer/status';
import type {RootState} from '../../../../store/reducers';
import {
    getConsumerMode,
    getOwner,
    getPartitionCount,
    getReadDataWeightRate,
    getReadRowCountRate,
    getStatusError,
} from '../../../../store/selectors/navigation/tabs/consumer';

import TargetQueue from './TargetQueue/TargetQueue';
import Meta from './Meta/Meta';
import ConsumerToolbar from './Toolbar/Toolbar';
import ConsumerMetrics from './views/ConsumerMetrics/ConsumerMetrics';
import Partitions from './views/Partitions/Partitions';
import PartitionsExtraControls from './views/Partitions/PartitionsExtraControls';

const views: Record<CONSUMER_MODE, {ExtraControls: ComponentType; View: ComponentType}> = {
    [CONSUMER_MODE.METRICS]: {ExtraControls: () => null, View: ConsumerMetrics},
    [CONSUMER_MODE.PARTITIONS]: {ExtraControls: PartitionsExtraControls, View: Partitions},
};

const emptyView: {ExtraControls: ComponentType; View: ComponentType} = {
    ExtraControls: () => null,
    View: () => null,
};

function useViewByMode(mode: CONSUMER_MODE): {ExtraControls: ComponentType; View: ComponentType} {
    return views[mode] || emptyView;
}

const Consumer: React.VFC<PropsFromRedux> = ({
    loadConsumerStatus,
    owner,
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
        return <YTErrorBlock error={statusError} topMargin="none" />;
    }

    return (
        <ErrorBoundary>
            <TargetQueue />
            <Meta
                owner={owner}
                partitionCount={partitionCount}
                readDataWeightRate={readDataWeightRate}
                readRowCountRate={readRowCountRate}
            />
            <WithStickyToolbar
                toolbar={
                    <Toolbar
                        itemsToWrap={[
                            {node: <ConsumerToolbar extras={ExtraControls} />, growable: true},
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
        owner: getOwner(state),
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
