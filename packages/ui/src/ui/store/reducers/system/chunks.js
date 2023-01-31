import {FETCH_CHUNKS} from '../../../store/actions/system/chunks';
import {mergeStateOnClusterChange} from '../../../store/reducers/utils';

const initialState = {
    fetching: false,
    error: null,

    replication: undefined,
    sealer: undefined,
    refresh: undefined,
    requisitionUpdate: undefined,

    cells: undefined,
    types: undefined,
};

function chunks(state = initialState, action) {
    switch (action.type) {
        case FETCH_CHUNKS.REQUEST:
            return {...state, fetching: true};
        case FETCH_CHUNKS.SUCCESS:
            return {...state, ...action.data, error: null, fetching: false};
        case FETCH_CHUNKS.FAILURE:
            return {...state, error: action.data, fetching: false};
        default:
            return state;
    }
}

export default mergeStateOnClusterChange(initialState, {}, chunks);
