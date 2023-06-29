import {DraftQuery, QueryEngine, QueryItem} from '../api';
import {
    REQUEST_QUERY,
    RequestQueryAction,
    SET_QUERY,
    SET_QUERY_LOAD_ERROR,
    SET_QUERY_PARAMS,
    SET_QUERY_PATCH,
    SetQueryAction,
    SetQueryErrorLoadAction,
    SetQueryParamsAction,
    SetQueryPatchAction,
    UPDATE_QUERY,
    UpdateQueryAction,
} from './actions';
import {cleanupQueryForDraft} from './utills';

export interface QueryState {
    queryItem?: QueryItem;
    draft: DraftQuery;
    params: {
        engine?: string;
        path?: string;
        cluster?: string;
        useDraft?: boolean;
    };
    state: 'init' | 'loading' | 'ready' | 'error';
}

const initialQueryDraftState: QueryState['draft'] = {
    engine: QueryEngine.YQL,
    query: '',
    settings: {},
};

const initState: QueryState = {
    queryItem: undefined,
    draft: {...initialQueryDraftState},
    params: {},
    state: 'init',
};

export function reducer(state = initState, action: Actions): QueryState {
    switch (action.type) {
        case SET_QUERY: {
            return {
                ...state,
                queryItem: action.data.initialQuery,
                draft: {
                    ...initialQueryDraftState,
                    ...(action.data.initialQuery
                        ? cleanupQueryForDraft({
                              ...action.data.initialQuery,
                              query: action.data.draftText || action.data.initialQuery.query,
                          })
                        : {}),
                },
                state: 'ready',
            };
        }
        case UPDATE_QUERY: {
            return {
                ...state,
                queryItem: action.data,
            };
        }
        case REQUEST_QUERY: {
            return {
                ...state,
                state: 'loading',
            };
        }
        case SET_QUERY_LOAD_ERROR: {
            return {
                ...state,
                state: 'error',
            };
        }
        case SET_QUERY_PATCH: {
            return {
                ...state,
                draft: {
                    ...state.draft,
                    ...action.data,
                },
            };
        }
        case SET_QUERY_PARAMS: {
            return {
                ...state,
                params: {
                    ...action.data.params,
                },
            };
        }
    }
    return state;
}

type Actions =
    | SetQueryAction
    | RequestQueryAction
    | SetQueryErrorLoadAction
    | SetQueryPatchAction
    | UpdateQueryAction
    | SetQueryParamsAction;
