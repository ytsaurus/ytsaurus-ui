import {mergeStateOnClusterChange} from '../../../../../store/reducers/utils';
import {
    GET_TABLETS,
    CHANGE_TABLETS_MODE,
    TOGGLE_HISTOGRAM,
    CHANGE_ACTIVE_HISTOGRAM,
    TABLETS_STATE_PARTIAL,
} from '../../../../../constants/navigation/tabs/tablets';

const persistedState = {
    tabletsFilter: '',
    tabletsMode: 'default',
    histogramType: 'unmerged_row_count',
    histogramCollapsed: true,
};

const ephemeralState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},

    tablets: [],

    expandedHosts: [],
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case GET_TABLETS.REQUEST:
            return {...state, loading: true};

        case GET_TABLETS.SUCCESS: {
            const {tablets} = action.data;

            return {
                ...state,
                tablets,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_TABLETS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_TABLETS.CANCELLED:
            return {...state, ...initialState};

        case CHANGE_TABLETS_MODE:
            return {...state, tabletsMode: action.data.tabletsMode};

        case TABLETS_STATE_PARTIAL:
            return {...state, ...action.data};

        case TOGGLE_HISTOGRAM:
            return {...state, histogramCollapsed: !state.histogramCollapsed};

        case CHANGE_ACTIVE_HISTOGRAM:
            return {...state, histogramType: action.data.histogramType};

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
