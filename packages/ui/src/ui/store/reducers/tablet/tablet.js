import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    CHANGE_ACTIVE_HISTOGRAM,
    CHANGE_CONTENT_MODE,
    LOAD_TABLET_DATA,
} from '../../../constants/tablet';

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    attributes: {},
    partitions: [],
    tabletErrors: [],
    replicationErrors: {},
    tablePath: '',
    cellLeadingPeer: {},
    activeHistogram: 'unmerged_row_count',
    pivotKey: undefined, // undefined or array
    nextPivotKey: undefined, // undefined or array
};

const persistedState = {
    contentMode: 'default',
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_TABLET_DATA.REQUEST:
            return {...state, loading: true};

        case LOAD_TABLET_DATA.SUCCESS: {
            return {
                ...state,
                ...action.data,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case LOAD_TABLET_DATA.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case LOAD_TABLET_DATA.CANCELLED:
            return {...state, ...ephemeralState};

        case CHANGE_CONTENT_MODE:
            return {...state, contentMode: action.data.contentMode};

        case CHANGE_ACTIVE_HISTOGRAM:
            return {...state, activeHistogram: action.data.activeHistogram};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
