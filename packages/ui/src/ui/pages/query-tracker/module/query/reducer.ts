import {DraftQuery, QueryItem} from '../api';
import {QueryEngine} from '../engines';
import {
    REQUEST_QUERY,
    RequestQueryAction,
    SET_QUERY,
    SET_QUERY_CLIQUE_LOADING,
    SET_QUERY_CLUSTER_CLIQUE,
    SET_QUERY_LOAD_ERROR,
    SET_QUERY_PARAMS,
    SET_QUERY_PATCH,
    SET_QUERY_READY,
    SetQueryAction,
    SetQueryCliqueLoading,
    SetQueryClusterClique,
    SetQueryErrorLoadAction,
    SetQueryParamsAction,
    SetQueryPatchAction,
    SetQueryReadyAction,
    UPDATE_ACO_QUERY,
    UPDATE_QUERY,
    UpdateACOQueryAction,
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
    dirtySinceLastSubmit: boolean;
    cliqueLoading: boolean;
    cliqueMap: Record<string, Record<string, {alias: string; yt_operation_id?: string}[]>>;
    state: 'init' | 'loading' | 'ready' | 'error';
}

const initialQueryDraftState: QueryState['draft'] = {
    engine: QueryEngine.YQL,
    query: '',
    files: [],
    settings: {},
    access_control_object: 'nobody',
};

const initState: QueryState = {
    queryItem: undefined,
    draft: {...initialQueryDraftState},
    params: {},
    dirtySinceLastSubmit: false,
    cliqueMap: {},
    cliqueLoading: false,
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
                          })
                        : {}),
                },
                dirtySinceLastSubmit: false,
                state: 'ready',
            };
        }
        case UPDATE_QUERY: {
            return {
                ...state,
                queryItem: action.data,
                draft: {
                    ...state.draft,
                    error: action.data?.error,
                },
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
        case SET_QUERY_READY: {
            return {
                ...state,
                state: 'ready',
            };
        }
        case SET_QUERY_PATCH: {
            const hasQuery = Boolean(action?.data?.query);

            return {
                ...state,
                draft: {
                    ...state.draft,
                    ...action.data,
                },
                dirtySinceLastSubmit: hasQuery,
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
        case SET_QUERY_CLIQUE_LOADING: {
            return {...state, cliqueLoading: action.data};
        }
        case SET_QUERY_CLUSTER_CLIQUE: {
            return {
                ...state,
                cliqueMap: {
                    ...state.cliqueMap,
                    [action.data.cluster]: {
                        ...state.cliqueMap[action.data.cluster],
                        [action.data.engine]: action.data.items,
                    },
                },
            };
        }

        case UPDATE_ACO_QUERY: {
            const access_control_object = action.data;

            return {
                ...state,
                queryItem: state.queryItem
                    ? {...state.queryItem, access_control_object}
                    : undefined,
                draft: {...state.draft, access_control_object},
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
    | SetQueryParamsAction
    | SetQueryReadyAction
    | UpdateACOQueryAction
    | SetQueryClusterClique
    | SetQueryCliqueLoading;
