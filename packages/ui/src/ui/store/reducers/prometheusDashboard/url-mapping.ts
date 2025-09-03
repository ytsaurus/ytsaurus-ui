import {PrometheusDashboardType} from '../../../../shared/prometheus/types';
import {LocationParameters} from '../../../store/location';
import {makeBase64ParseSerialize, makeTimeRangeSerialization} from '../../../utils/parse-serialize';
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
