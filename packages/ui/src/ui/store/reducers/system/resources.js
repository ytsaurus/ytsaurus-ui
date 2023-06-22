import {FETCH_NODE_ATTRS, FETCH_RESOURCES} from '../../../store/actions/system/resources';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

const initialState = {
    loaded: false,
    nodeAttrsLoaded: false,
    fetching: false,
    resources: {},
    nodeAttributes: undefined,
};
function resources(state = initialState, action) {
    switch (action.type) {
        case FETCH_RESOURCES.REQUEST:
            return {...state, fetching: true};
        case FETCH_RESOURCES.SUCCESS:
            return {
                ...state,
                fetching: false,
                resources: action.data,
                loaded: true,
            };
        case FETCH_NODE_ATTRS.SUCCESS:
            return {
                ...state,
                fetching: false,
                nodeAttributes: action.data,
                nodeAttrsLoaded: true,
            };
        case FETCH_RESOURCES.FAILURE:
            return {...state, fetching: false};
        case FETCH_NODE_ATTRS.FAILURE:
            return {...state, fetching: false};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, resources);
