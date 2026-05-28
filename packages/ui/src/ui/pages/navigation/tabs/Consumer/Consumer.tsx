import React, {type ComponentType, useEffect} from 'react';
import {type ConnectedProps, connect} from 'react-redux';

import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {CONSUMER_MODE} from '../../../../constants/navigation/tabs/consumer';
import {loadConsumerStatus} from '../../../../store/actions/navigation/tabs/consumer/status';
import {type RootState} from '../../../../store/reducers';
import {
    selectConsumerMode,
    selectOwner,
    selectPartitionCount,
    selectReadDataWeightRate,
    selectReadRowCountRate,
    selectStatusError,
} from '../../../../store/selectors/navigation/tabs/consumer';

import {QueueError} from '../Queue/QueueError';

import TargetQueue from './TargetQueue/TargetQueue';
import Meta from './Meta/Meta';
import ConsumerToolbar from './Toolbar/Toolbar';
import {RegisterConsumerDialog} from './modals/RegisterDialog';
import ConsumerMetrics from './views/ConsumerMetrics/ConsumerMetrics';
import Partitions from './views/Partitions/Partitions';
import PartitionsExtraControls from './views/Partitions/PartitionsExtraControls';

const VIEWS: Record<CONSUMER_MODE, {ExtraControls: ComponentType; View: ComponentType}> = {
    [CONSUMER_MODE.METRICS]: {ExtraControls: () => null, View: ConsumerMetrics},
    [CONSUMER_MODE.PARTITIONS]: {ExtraControls: PartitionsExtraControls, View: Partitions},
};

const emptyView: {ExtraControls: ComponentType; View: ComponentType} = {
    ExtraControls: () => null,
    View: () => null,
};

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

    const {ExtraControls, View} = VIEWS[consumerMode] ?? emptyView;

    if (statusError) {
        return <QueueError error={statusError} topMargin="none" />;
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
            <RegisterConsumerDialog />
        </ErrorBoundary>
    );
};

function mapStateToProps(state: RootState) {
    return {
        owner: selectOwner(state),
        partitionCount: selectPartitionCount(state),
        readDataWeightRate: selectReadDataWeightRate(state),
        readRowCountRate: selectReadRowCountRate(state),
        consumerMode: selectConsumerMode(state),
        statusError: selectStatusError(state),
    };
}

const mapDispatchToProps = {
    loadConsumerStatus,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(Consumer);
