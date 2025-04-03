import {LocationParameters} from '../../../store/location';
import {makeTimeRangeSerialization} from '../../../utils/parse-serialize';
import {PrometheusDashboardType, initialState} from './prometheusDahsboard';

export function prometheusDashboardExpandedParams(
    type: PrometheusDashboardType,
): LocationParameters {
    return {
        pdExpanded: {
            stateKey: `prometheusDashboard.expandedPanels.${type}`,
            initialState: initialState.expandedPanels[type],
        },
        pdTime: {
            stateKey: 'prometheusDashboard.timeRangeFilter',
            initialState: initialState.timeRangeFilter,
            options: makeTimeRangeSerialization(initialState.timeRangeFilter),
        },
    };
}
