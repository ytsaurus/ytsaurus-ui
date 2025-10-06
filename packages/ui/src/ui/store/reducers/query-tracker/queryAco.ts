import {Action} from 'redux';
import {ActionD} from '../../../types';
import {GetQueryTrackerInfoResponse} from '../../../../shared/yt-types';
import createActionTypes, {createPrefix} from '../../../constants/utils';

const PREFIX = createPrefix('query-tracker/QUERY_ACO');

export const QUERY_ACO_LOADING = createActionTypes(PREFIX + 'LOADING');

export interface QueryACOState {
    data: GetQueryTrackerInfoResponse;
    loading: boolean;
    loaded: boolean;
    error: string | null;
}

const initialState: QueryACOState = {
    data: {
        cluster_name: '',
        access_control_objects: [],
        query_tracker_stage: '',
        supported_features: {
            access_control: false,
        },
    },
    loading: false,
    loaded: false,
    error: null,
};
export function queryAco(state = initialState, action: QueryACOActions): QueryACOState {
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

export type QueryACOActions =
    | ActionD<typeof QUERY_ACO_LOADING.SUCCESS, Pick<QueryACOState, 'data'>>
    | Action<typeof QUERY_ACO_LOADING.FAILURE>
    | Action<typeof QUERY_ACO_LOADING.REQUEST>;
