import {Action} from 'redux';

import {ActionD} from '../../../../types';

import type {DraftQuery, QueryItem} from '../api';
import {QueryEngine} from '../engines';
import {
    REQUEST_QUERY,
    SET_QUERY,
    SET_QUERY_CLIQUE_LOADING,
    SET_QUERY_CLUSTER_CLIQUE,
    SET_QUERY_LOAD_ERROR,
    SET_QUERY_PARAMS,
    SET_QUERY_PATCH,
    SET_QUERY_READY,
    UPDATE_ACO_QUERY,
    UPDATE_QUERY,
} from '../query-tracker-contants';
import {cleanupQueryForDraft} from './utills';
import {DEFAULT_QUERY_ACO} from './selectors';

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
    access_control_object: DEFAULT_QUERY_ACO, // deprecated parameter
    access_control_objects: [DEFAULT_QUERY_ACO],
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
            return {
                ...state,
                queryItem: state.queryItem ? {...state.queryItem, ...action.data} : undefined,
                draft: {...state.draft, ...action.data},
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

export type RequestQueryAction = Action<typeof REQUEST_QUERY>;

export type SetQueryReadyAction = Action<typeof SET_QUERY_READY>;

export type SetQueryAction = ActionD<
    typeof SET_QUERY,
    {
        initialQuery?: QueryItem;
        draftText?: string;
    }
>;

export type UpdateQueryAction = ActionD<typeof UPDATE_QUERY, QueryItem>;

export type SetQueryErrorLoadAction = ActionD<typeof SET_QUERY_LOAD_ERROR, Error | string>;

export type SetQueryPatchAction = ActionD<typeof SET_QUERY_PATCH, QueryState['draft']>;

export type SetQueryParamsAction = ActionD<
    typeof SET_QUERY_PARAMS,
    Partial<Pick<QueryState, 'params'>>
>;

export type SetQueryCliqueLoading = ActionD<typeof SET_QUERY_CLIQUE_LOADING, boolean>;

export type SetQueryClusterClique = ActionD<
    typeof SET_QUERY_CLUSTER_CLIQUE,
    {
        cluster: string;
        engine: QueryEngine.SPYT | QueryEngine.CHYT;
        items: {alias: string; yt_operation_id?: string}[];
    }
>;

export type UpdateACOQueryAction = ActionD<
    typeof UPDATE_ACO_QUERY,
    {access_control_object: string} | {access_control_objects: Array<string>}
>;
