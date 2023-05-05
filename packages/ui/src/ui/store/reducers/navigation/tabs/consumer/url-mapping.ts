import produce from 'immer';

import type {RootState} from '../../../../../store/reducers';
import {initialState} from '../../../../../store/reducers/navigation/tabs/consumer/filters';
import {updateIfChanged} from '../../../../../utils/utils';

export const consumerParams = {
    cMode: {
        stateKey: 'navigation.tabs.consumer.filters.consumerMode',
        initialState: initialState.consumerMode,
    },
    cPrtnIndex: {
        stateKey: 'navigation.tabs.consumer.filters.consumerPartitionIndex',
        initialState: initialState.consumerPartitionIndex,
    },
    cRateMode: {
        stateKey: 'navigation.tabs.consumer.filters.consumerRateMode',
        initialState: initialState.consumerRateMode,
    },
    cQueue: {
        stateKey: 'navigation.tabs.consumer.filters.targetQueue.queue',
        initialState: initialState.targetQueue?.queue,
    },
};

export function getNavigationConsumerPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        updateIfChanged(
            draft.navigation.tabs.consumer.filters,
            'consumerMode',
            query.navigation.tabs.consumer.filters.consumerMode,
        );
        updateIfChanged(
            draft.navigation.tabs.consumer.filters,
            'consumerPartitionIndex',
            query.navigation.tabs.consumer.filters.consumerPartitionIndex,
        );
        updateIfChanged(
            draft.navigation.tabs.consumer.filters,
            'consumerRateMode',
            query.navigation.tabs.consumer.filters.consumerRateMode,
        );
        updateIfChanged(
            draft.navigation.tabs.consumer.filters,
            'targetQueue',
            query.navigation.tabs.consumer.filters.targetQueue,
        );
    });
}
