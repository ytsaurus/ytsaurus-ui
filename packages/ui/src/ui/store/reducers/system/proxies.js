import _ from 'lodash';
import ypath from '../../../common/thor/ypath';
import {FETCH_PROXIES} from '../../../store/actions/system/proxies';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';

const initialState = {
    fetching: false,
    loaded: false,
    error: null,
    roleGroups: [],
    counters: {},
};

class Proxy {
    constructor(data) {
        this.name = data.name;
        this.host = data.name;

        this.state = data && data.dead ? 'offline' : 'online';
        this.banned = data && data.banned;
        this.banMessage = (data && data.ban_message) || 'Ban message omitted';
        this.effectiveState = this.banned ? 'banned' : this.state;
        this.role = data && data.role;
        this.liveness = data && data.liveness;
        this.loadAverage = ypath.getValue(this.liveness, '/load_average');
        this.updatedAt = ypath.getValue(this.liveness, '/updated_at');
        this.networkLoad = ypath.getValue(this.liveness, '/network_coef');
    }
}

function proxies(state = initialState, action) {
    switch (action.type) {
        case FETCH_PROXIES.REQUEST:
            return {...state, fetching: true};
        case FETCH_PROXIES.SUCCESS: {
            const proxies = _.map(action.data, (data) => new Proxy(data));
            return {
                ...state,
                fetching: false,
                roleGroups: extractRoleGroups(proxies),
                counters: extractProxyCounters(proxies),
                error: null,
                loaded: true,
            };
        }
        case FETCH_PROXIES.FAILURE:
            return {...state, fetching: false, error: action.data};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, proxies);
