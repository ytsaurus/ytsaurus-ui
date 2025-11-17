import {produce} from 'immer';

import {LocationParameters} from '../../../store/location';
import {makeBase64ParseSerialize, makeTimeRangeSerialization} from '../../../utils/parse-serialize';
import {RootState} from '../../../store/reducers/index.main';
import {updateByLocationParams} from '../../../utils/utils';

import {initialState} from './prometheusDashboard';

export const prometheusDashboardParams: LocationParameters = {
    pdExpanded: {
        stateKey: `prometheusDashboard.expandedPanels`,
        initialState: initialState.expandedPanels,
        options: makeBase64ParseSerialize(initialState.expandedPanels),
    },
    pdTime: {
        stateKey: 'prometheusDashboard.timeRangeFilter',
        initialState: initialState.timeRangeFilter,
        options: makeTimeRangeSerialization(initialState.timeRangeFilter),
    },
    pdType: {
        stateKey: 'prometheusDashboard.type',
        initialState: initialState.type,
    },
    pdParams: {
        stateKey: `prometheusDashboard.params`,
        initialState: initialState.params,
        options: makeBase64ParseSerialize(initialState.params),
    },
};

export function getPrometheusDashbaordPreparedState(state: RootState, {query}: {query: RootState}) {
    return produce(state, (draft) => {
        return updateByLocationParams({draft, query}, prometheusDashboardParams);
    });
}
