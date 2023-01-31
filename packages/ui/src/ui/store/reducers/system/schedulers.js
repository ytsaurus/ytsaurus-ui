import {FETCH_SCHEDULERS} from '../../../constants/system/schedulers';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

const initialState = {
    fetching: false,
    hasError: false,
    error: {},

    schedulers: [],
    schedulerAlerts: [],
    agents: [],
    agentAlerts: [],
};

function schedulersAndAgents(state = initialState, action) {
    switch (action.type) {
        case FETCH_SCHEDULERS.REQUEST:
            return {...state, fetching: true};

        case FETCH_SCHEDULERS.SUCCESS: {
            const {schedulers, schedulerAlerts, agents, agentAlerts} = action.data;
            return {
                ...state,
                fetching: false,
                schedulers,
                schedulerAlerts,
                agents,
                agentAlerts,
            };
        }
        case FETCH_SCHEDULERS.FAILURE:
            return {...state, ...initialState, error: action.data};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, schedulersAndAgents);
