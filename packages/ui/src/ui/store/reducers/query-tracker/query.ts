import {Action} from 'redux';

import {ActionD} from '../../../types';

import type {DraftQuery, QueryItem} from '../../../types/query-tracker/api';
import {QueryEngine} from '../../../../shared/constants/engines';
import {
    REQUEST_QUERY,
    SET_DIRTY_SUBMIT,
    SET_QUERY,
    SET_QUERY_CLIQUE_LOADING,
    SET_QUERY_CLUSTER_CLIQUE,
    SET_QUERY_CLUSTER_LOADING,
    SET_QUERY_LOAD_ERROR,
    SET_QUERY_PARAMS,
    SET_QUERY_PATCH,
    SET_QUERY_READY,
    SET_SUPPORTED_ENGINE,
    UPDATE_ACO_QUERY,
    UPDATE_DRAFT,
    UPDATE_QUERY,
    UPDATE_QUERY_ITEM,
} from './query-tracker-contants';
import {cleanupQueryForDraft} from '../../../types/query-tracker/query';
import {DEFAULT_QUERY_ACO} from '../../selectors/query-tracker/query';
import {ChytInfo} from '../chyt/list';

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
    clusterLoading: boolean;
    cliqueMap: Record<string, Record<string, ChytInfo[]>>;
    state: 'init' | 'loading' | 'ready' | 'error';
}

const initialQueryDraftState: QueryState['draft'] = {
    engine: QueryEngine.YQL,
    supportedEngines: {
        yql: true,
        chyt: true,
        spyt: true,
        ql: true,
    },
    query: '',
    files: [],
    secrets: [],
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
    clusterLoading: false,
    state: 'init',
};

export function query(state = initState, action: Actions): QueryState {
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
                    ...action.data,
                    error: action.data?.error,
                },
            };
        }
        case UPDATE_DRAFT: {
            return {
                ...state,
                draft: {
                    ...state.draft,
                    ...action.data,
                },
            };
        }
        case SET_DIRTY_SUBMIT: {
            return {
                ...state,
                dirtySinceLastSubmit: action.data,
            };
        }
        case UPDATE_QUERY_ITEM: {
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
        case SET_QUERY_CLUSTER_LOADING: {
            return {...state, clusterLoading: action.data};
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
        case SET_SUPPORTED_ENGINE: {
            return {
                ...state,
                draft: {
                    ...state.draft,
                    supportedEngines: action.data,
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
    | UpdateDraftAction
    | UpdateQueryItem
    | SetQueryParamsAction
    | SetQueryReadyAction
    | UpdateACOQueryAction
    | SetQueryClusterClique
    | SetQueryCliqueLoading
    | SetQueryClusterLoading
    | SetDirtySubmit
    | SetSupportedEngines;

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
export type UpdateDraftAction = ActionD<typeof UPDATE_DRAFT, DraftQuery>;
export type UpdateQueryItem = ActionD<typeof UPDATE_QUERY_ITEM, QueryItem>;
export type SetDirtySubmit = ActionD<typeof SET_DIRTY_SUBMIT, boolean>;

export type SetQueryErrorLoadAction = ActionD<typeof SET_QUERY_LOAD_ERROR, Error | string>;

export type SetQueryPatchAction = ActionD<typeof SET_QUERY_PATCH, QueryState['draft']>;

export type SetQueryParamsAction = ActionD<
    typeof SET_QUERY_PARAMS,
    Partial<Pick<QueryState, 'params'>>
>;

export type SetQueryCliqueLoading = ActionD<typeof SET_QUERY_CLIQUE_LOADING, boolean>;
export type SetQueryClusterLoading = ActionD<typeof SET_QUERY_CLUSTER_LOADING, boolean>;

export type SetQueryClusterClique = ActionD<
    typeof SET_QUERY_CLUSTER_CLIQUE,
    {
        cluster: string;
        engine: QueryEngine.SPYT | QueryEngine.CHYT;
        items: ChytInfo[];
    }
>;

export type UpdateACOQueryAction = ActionD<
    typeof UPDATE_ACO_QUERY,
    {access_control_object: string} | {access_control_objects: Array<string>}
>;

export type SetSupportedEngines = ActionD<
    typeof SET_SUPPORTED_ENGINE,
    QueryState['draft']['supportedEngines']
>;
