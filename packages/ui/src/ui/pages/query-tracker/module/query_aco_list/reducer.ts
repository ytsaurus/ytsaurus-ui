import {QUERY_ACO_LIST_LOADING, QUERY_ACO_LIST_SUCCESS, QueryACOActions} from './actions';

export interface QueryACOListState {
    list: string[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: QueryACOListState = {
    list: [],
    status: 'idle',
    error: null,
};
export function reducer(state = initialState, action: QueryACOActions): QueryACOListState {
    switch (action.type) {
        case QUERY_ACO_LIST_LOADING: {
            return {
                ...state,
                status: 'loading',
            };
        }

        case QUERY_ACO_LIST_SUCCESS: {
            return {
                ...state,
                error: null,
                status: 'succeeded',
                list: action.data,
            };
        }

        default:
            return state;
    }
}
