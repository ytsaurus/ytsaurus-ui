import {produce} from 'immer';
import {RootState} from '../../../../store/reducers';

import {initialState as statisticsInitialState} from '../../../../store/reducers/operations/statistics/statistics';
import {updateIfChanged} from '../../../../utils/utils';
import {LocationParameters} from '../../../../store/location';

const initialFilter = statisticsInitialState.filterText;

export const statisticsParams: LocationParameters = {
    filter: {
        stateKey: 'operations.statistics.filterText',
        initialState: initialFilter,
    },
    jobType: {
        stateKey: 'operations.statistics.jobTypeFilter',
    },
    poolTree: {
        stateKey: 'operations.statistics.poolTreeFilter',
    },
    aggregator: {
        stateKey: 'operations.statistics.activeAggregation',
    },
};

export function getStatisticsPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        const draftStatistics = draft.operations.statistics;
        const queryStatistics = query.operations.statistics;

        updateIfChanged(draftStatistics, 'filterText', queryStatistics.filterText);
        updateIfChanged(draftStatistics, 'jobTypeFilter', queryStatistics.jobTypeFilter);
        updateIfChanged(draftStatistics, 'poolTreeFilter', queryStatistics.poolTreeFilter);
        updateIfChanged(draftStatistics, 'activeAggregation', queryStatistics.activeAggregation);
    });
}
