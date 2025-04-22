import {produce} from 'immer';

import {LocationParameters} from '../../../../store/location';
import {updateByLocationParams} from '../../../../utils/utils';

import type {SystemMonitoringState} from './index';

export const systemMonitoringParams: LocationParameters = {
    activeTab: {
        stateKey: 'systemMonitoring.activeTab',
        initialState: undefined,
    },
    masterLocalContainer: {
        stateKey: 'systemMonitoring.masterLocalContainer',
        initialState: undefined,
    },
};

export function getSystemMonitoringState(
    state: SystemMonitoringState,
    {query}: {query: SystemMonitoringState},
): SystemMonitoringState {
    return produce(state, (draft) => {
        return updateByLocationParams({draft, query}, systemMonitoringParams);
    });
}
