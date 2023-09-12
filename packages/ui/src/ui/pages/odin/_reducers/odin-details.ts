import moment from 'moment';

import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {FIX_MY_TYPE} from '../../../types';
import {
    DATE_FORMAT,
    GET_METRIC_DATA,
    ODIN_DATA_FIELDS,
    SET_DATE,
    SET_HOURS_MINUTES,
    SET_METRIC,
    TOGGLE_USE_CURRENT_DATE,
} from '../odin-constants';
import {currentDate} from '../odin-utils';

export interface OdinDetailsEphemeral {
    metricAvailability: Array<{
        message: string;
        state: 'available' | 'no_data' | 'unavailable' | 'partially_available';
    }>;
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: unknown;
}

export interface OdinDetailsPersisted {
    metric: string;
    useCurrentDate: boolean;
    date: string | null;
    hours: number;
    minutes: number;
    odinCluster: string;
    clusterNames: Array<string>;
}

const ephemeralState: OdinDetailsEphemeral = {
    metricAvailability: [],
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
};

const persistedState: OdinDetailsPersisted = {
    metric: '',
    useCurrentDate: true,
    date: null,
    hours: -1,
    minutes: -1,
    odinCluster: '',
    clusterNames: [],
};

export const initialState = {
    ...ephemeralState,
    ...persistedState,
};

const reducer = (state = initialState, action: {type: string; data?: FIX_MY_TYPE}) => {
    switch (action.type) {
        case ODIN_DATA_FIELDS: {
            return {...state, ...action.data};
        }
        case GET_METRIC_DATA.REQUEST:
            return {...state, loading: true};

        case GET_METRIC_DATA.SUCCESS: {
            const {metricAvailability} = action.data;
            return {
                ...state,

                metricAvailability,

                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_METRIC_DATA.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case SET_METRIC:
            return {...state, metric: action.data.metric};

        case TOGGLE_USE_CURRENT_DATE: {
            const {useCurrentDate: prevUseCurrentDate} = state;
            const useCurrentDate = !prevUseCurrentDate;
            return {
                ...state,
                useCurrentDate,
                date: useCurrentDate ? null : currentDate(),
            };
        }

        case SET_DATE: {
            const {date} = action.data;
            const newDate = moment(date).format(DATE_FORMAT);
            const isCurrentDate = newDate === currentDate();
            return {
                ...state,
                date: isCurrentDate ? null : newDate,
                useCurrentDate: isCurrentDate,
            };
        }

        case SET_HOURS_MINUTES: {
            const {hours, minutes} = action.data;
            return {
                ...state,
                hours,
                minutes,
            };
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(ephemeralState, persistedState, reducer);
