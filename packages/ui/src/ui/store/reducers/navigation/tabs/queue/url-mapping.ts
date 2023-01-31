import produce from 'immer';

import type {RootState} from '../../../../../store/reducers';
import {initialState} from '../../../../../store/reducers/navigation/tabs/queue/filters';
import {updateIfChanged} from '../../../../../utils/utils';

export const queueParams = {
    qMode: {
        stateKey: 'navigation.tabs.queue.filters.queueMode',
        initialState: initialState.queueMode,
    },
    qPrtnIndex: {
        stateKey: 'navigation.tabs.queue.filters.queuePartitionIndex',
        initialState: initialState.queuePartitionIndex,
    },
    qTcHost: {
        stateKey: 'navigation.tabs.queue.filters.queueTabletCellHost',
        initialState: initialState.queueTabletCellHost,
    },
    qTcId: {
        stateKey: 'navigation.tabs.queue.filters.queueTabletCellId',
        initialState: initialState.queueTabletCellId,
    },
    qCnsmrName: {
        stateKey: 'navigation.tabs.queue.filters.queueConsumerName',
        initialState: initialState.queueConsumerName,
    },
    qOwner: {
        stateKey: 'navigation.tabs.queue.filters.queueOwner',
        initialState: initialState.queueOwner,
    },
    qRateMode: {
        stateKey: 'navigation.tabs.queue.filters.queueRateMode',
        initialState: initialState.queueRateMode,
    },
};

export function getNavigationQueuePreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queueMode',
            query.navigation.tabs.queue.filters.queueMode,
        );
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queuePartitionIndex',
            query.navigation.tabs.queue.filters.queuePartitionIndex,
        );
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queueTabletCellHost',
            query.navigation.tabs.queue.filters.queueTabletCellHost,
        );
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queueTabletCellId',
            query.navigation.tabs.queue.filters.queueTabletCellId,
        );
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queueConsumerName',
            query.navigation.tabs.queue.filters.queueConsumerName,
        );
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queueOwner',
            query.navigation.tabs.queue.filters.queueOwner,
        );
        updateIfChanged(
            draft.navigation.tabs.queue.filters,
            'queueRateMode',
            query.navigation.tabs.queue.filters.queueRateMode,
        );
    });
}
