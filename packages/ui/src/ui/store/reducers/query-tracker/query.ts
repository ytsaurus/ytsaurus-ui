import {type Action} from 'redux';
import isEqual_ from 'lodash/isEqual';

import {type ActionD} from '../../../types';

import {type DraftQuery, type QueryItem} from '../../../types/query-tracker/api';
import {QueryEngine} from '../../../../shared/constants/engines';
import {
    REQUEST_QUERY,
    RESTORE_QUERY_DIRTY_AFTER_SUBMIT,
    SET_DIRTY_SUBMIT,
    SET_QUERY,
    SET_QUERY_CLIQUE_LOADING,
    SET_QUERY_CLUSTER_CLIQUE,
    SET_QUERY_CLUSTER_LOADING,
    SET_QUERY_FILES,
    SET_QUERY_LOAD_ERROR,
    SET_QUERY_PARAMS,
    SET_QUERY_PATCH,
    SET_QUERY_READY,
    SET_QUERY_SUBMITTING,
    SET_SUPPORTED_ENGINE,
    UPDATE_ACO_QUERY,
    UPDATE_DRAFT,
    UPDATE_QUERY,
    UPDATE_QUERY_ITEM,
} from './query-tracker-contants';
import {cleanupQueryForDraft} from '../../../types/query-tracker/query';
import type {SetQueryFilesAction} from './queryFilesFormSlice';
import {type ChytInfo} from '../chyt/list';

export interface QueryState {
    sessionRevision: number;
    submittingRevision?: number;
    queryItem?: QueryItem;
    draft: DraftQuery;
    params: {
        engine?: string;
        path?: string;
        cluster?: string;
        useDraft?: boolean;
    };
    dirtySinceLastSubmit: boolean;
    dirtyNonAnnotationFields: boolean;
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
};

const initState: QueryState = {
    sessionRevision: 0,
    queryItem: undefined,
    draft: {...initialQueryDraftState},
    params: {},
    dirtySinceLastSubmit: false,
    dirtyNonAnnotationFields: false,
    cliqueMap: {},
    cliqueLoading: false,
    clusterLoading: false,
    state: 'init',
};

const draftFields: (keyof DraftQuery)[] = [
    'query',
    'engine',
    'files',
    'settings',
    'secrets',
    'access_control_object',
    'access_control_objects',
];

function hasUserDraftChanges(draft: DraftQuery, action: SetQueryPatchAction) {
    return (
        action.meta?.source !== 'system' &&
        draftFields.some(
            (key) => Object.hasOwn(action.data, key) && !isEqual_(draft[key], action.data[key]),
        )
    );
}

function getSessionRevision(state: QueryState, next?: QueryItem) {
    return next?.id && next.id === state.queryItem?.id
        ? state.sessionRevision
        : (state.sessionRevision ?? 0) + 1;
}

export function query(state = initState, action: Actions): QueryState {
    switch (action.type) {
        case SET_QUERY_SUBMITTING: {
            if (action.data.pending) return {...state, submittingRevision: action.data.revision};
            if (state.submittingRevision !== action.data.revision) return state;
            return {...state, submittingRevision: undefined};
        }
        case SET_QUERY: {
            return {
                ...state,
                queryItem: action.data.initialQuery,
                sessionRevision: getSessionRevision(state, action.data.initialQuery),
                draft: {
                    ...initialQueryDraftState,
                    ...(action.data.initialQuery
                        ? cleanupQueryForDraft({
                              ...action.data.initialQuery,
                          })
                        : {}),
                },
                dirtySinceLastSubmit: false,
                dirtyNonAnnotationFields: false,
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
                dirtyNonAnnotationFields: action.data,
            };
        }
        case RESTORE_QUERY_DIRTY_AFTER_SUBMIT: {
            if (state.sessionRevision !== action.data.revision) return state;
            const dirtyNonAnnotationFields =
                state.dirtyNonAnnotationFields || action.data.dirtyNonAnnotationFields;
            const savedAnnotations = state.queryItem
                ? cleanupQueryForDraft(state.queryItem).annotations
                : undefined;
            return {
                ...state,
                dirtyNonAnnotationFields,
                dirtySinceLastSubmit:
                    dirtyNonAnnotationFields ||
                    !isEqual_(state.draft.annotations || {}, savedAnnotations || {}),
            };
        }
        case UPDATE_QUERY_ITEM: {
            return {
                ...state,
                queryItem: action.data,
                dirtySinceLastSubmit:
                    state.dirtyNonAnnotationFields ||
                    (state.dirtySinceLastSubmit &&
                        !isEqual_(state.draft.annotations, action.data.annotations)),
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
        case SET_QUERY_FILES: {
            return {
                ...state,
                draft: {...state.draft, files: action.data.files},
                dirtyNonAnnotationFields:
                    state.dirtyNonAnnotationFields ||
                    !isEqual_(state.draft.files, action.data.files),
                dirtySinceLastSubmit:
                    state.dirtySinceLastSubmit || !isEqual_(state.draft.files, action.data.files),
            };
        }
        case SET_QUERY_PATCH: {
            const dirtyNonAnnotationFields =
                state.dirtyNonAnnotationFields || hasUserDraftChanges(state.draft, action);
            const dirtyAnnotations = Object.hasOwn(action.data, 'annotations')
                ? !isEqual_(action.data.annotations, state.queryItem?.annotations)
                : state.dirtySinceLastSubmit;
            return {
                ...state,
                draft: {
                    ...state.draft,
                    ...action.data,
                },
                dirtyNonAnnotationFields,
                dirtySinceLastSubmit: dirtyNonAnnotationFields || dirtyAnnotations,
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

export type SetQuerySubmitting = ActionD<
    typeof SET_QUERY_SUBMITTING,
    {revision: number; pending: boolean}
>;

type Actions =
    | RestoreQueryDirtyAfterSubmit
    | SetQueryFilesAction
    | SetQuerySubmitting
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

export type SetQueryPatchAction = ActionD<typeof SET_QUERY_PATCH, Partial<DraftQuery>> & {
    meta?: {source: 'user' | 'system'};
};

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

export type RestoreQueryDirtyAfterSubmit = ActionD<
    typeof RESTORE_QUERY_DIRTY_AFTER_SUBMIT,
    {revision: number; dirtyNonAnnotationFields: boolean}
>;
