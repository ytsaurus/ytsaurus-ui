import {QUERY_ACO_LOADING} from './constants';
import {QueryACOActions} from './actions';

export interface QueryACOState {
    data: {
        cluster_name: string;
        access_control_objects: string[];
        supported_features: {access_control: boolean; multiple_aco?: boolean};
    };
    loading: boolean;
    loaded: boolean;
    error: string | null;
}

const initialState: QueryACOState = {
    data: {
        cluster_name: '',
        access_control_objects: [],
        supported_features: {
            access_control: false,
        },
    },
    loading: false,
    loaded: false,
    error: null,
};
export function reducer(state = initialState, action: QueryACOActions): QueryACOState {
    switch (action.type) {
        case QUERY_ACO_LOADING.REQUEST: {
            return {
                ...state,
                loading: true,
            };
        }

        case QUERY_ACO_LOADING.SUCCESS: {
            return {
                ...state,
                error: null,
                loading: false,
                loaded: true,
                ...action.data,
            };
        }

        case QUERY_ACO_LOADING.FAILURE: {
            return {
                ...state,
                error: null,
                loading: false,
            };
        }

        default:
            return state;
    }
}
