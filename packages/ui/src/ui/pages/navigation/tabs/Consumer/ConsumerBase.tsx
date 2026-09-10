import React, {type ComponentType, useEffect} from 'react';

import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import WithStickyToolbar from '../../../../components/WithStickyToolbar/WithStickyToolbar';
import {Toolbar} from '../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {CONSUMER_MODE} from '../../../../constants/navigation/tabs/consumer';
import {type TPerformanceCounters} from '../../../../store/reducers/navigation/tabs/queue/types';
import {type YTError} from '../../../../types';

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

export const ConsumerBase: React.VFC<PropsFromRedux> = ({
    loadConsumerStatus,
    owner,
    partitionCount,
    queueAgentHost,
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
                queueAgentHost={queueAgentHost}
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
type PropsFromRedux = {
    owner: string | undefined;
    partitionCount: number | undefined;
    queueAgentHost: string | undefined;
    readDataWeightRate: TPerformanceCounters;
    readRowCountRate: TPerformanceCounters;
    consumerMode: CONSUMER_MODE;
    statusError: YTError | null;
    loadConsumerStatus: () => void;
};
