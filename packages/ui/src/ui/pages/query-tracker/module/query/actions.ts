import {createQueryUrl} from '../../utils/navigation';
import {Action} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../../store/reducers';
import {getCluster} from '../../../../store/selectors/global';
import {ActionD} from '../../../../types';
import {
    QueryEngine,
    QueryFile,
    QueryItem,
    abortQuery,
    generateQueryFromTable,
    getQuery,
    startQuery,
} from '../api';
import {requestQueriesList} from '../queries_list/actions';
import {getAppBrowserHistory} from '../../../../store/window-store';
import {QueryState} from './reducer';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {prepareQueryPlanIds} from './utills';

import {
    getCurrentDraftFile,
    getCurrentQuery,
    getDraftFiles,
    getDraftFilesQueue,
    getOpenDraftFiles,
    getQueryDraft,
} from './selectors';

export const REQUEST_QUERY = 'query-tracker/REQUEST_QUERY';
export type RequestQueryAction = Action<typeof REQUEST_QUERY>;

export const SET_QUERY_READY = 'query-tracker/SET_QUERY_READY';
export type SetQueryReadyAction = Action<typeof SET_QUERY_READY>;

export const SET_QUERY = 'query-tracker/SET_QUERY';
export type SetQueryAction = ActionD<
    typeof SET_QUERY,
    {
        initialQuery?: QueryItem;
        draftText?: string;
    }
>;

export const UPDATE_QUERY = 'query-tracker/UPDATE_QUERY';
export type UpdateQueryAction = ActionD<typeof UPDATE_QUERY, QueryItem>;

export const SET_QUERY_LOAD_ERROR = 'query-tracker/SET_QUERY_LOAD_ERROR';
export type SetQueryErrorLoadAction = ActionD<typeof SET_QUERY_LOAD_ERROR, Error | string>;

export const SET_QUERY_PATCH = 'query-tracker/SET_QUERY_PATCH';
export type SetQueryPatchAction = ActionD<typeof SET_QUERY_PATCH, Pick<QueryState, 'draft'>>;

export const SET_QUERY_PARAMS = 'query-tracker/SET_QUERY_PARAMS';
export type SetQueryParamsAction = ActionD<
    typeof SET_QUERY_PARAMS,
    Partial<Pick<QueryState, 'params'>>
>;

export const UPDATE_DRAFT_FILES = 'query-tracker/UPDATE_DRAFT_FILES';
type UpdateDraftFilesActionPayload = Partial<
    Pick<QueryState, 'openFilesTabs' | 'openTabsQueue'> & {
        files: QueryState['draft']['files'];
    }
>;
export type UpdateDraftFilesAction = ActionD<
    typeof UPDATE_DRAFT_FILES,
    Partial<UpdateDraftFilesActionPayload>
>;

export function loadQuery(
    queryId: string,
): ThunkAction<any, RootState, any, SetQueryAction | RequestQueryAction | SetQueryErrorLoadAction> {
    return async (dispatch, _getState) => {
        dispatch({type: REQUEST_QUERY});
        try {
            const query = await wrapApiPromiseByToaster(dispatch(getQuery(queryId)), {
                toasterName: 'load_query',
                skipSuccessToast: true,
                errorTitle: 'Failed to load query',
            });
            dispatch({
                type: SET_QUERY,
                data: {
                    initialQuery: prepareQueryPlanIds(query),
                },
            });
        } catch (e: unknown) {
            dispatch(createEmptyQuery());
        }
    };
}

export function updateQueryDraft(data: Partial<QueryState['draft']>) {
    return {type: SET_QUERY_PATCH, data};
}

const getDraftFilesData = (state: RootState) => ({
    files: [...getDraftFiles(state)],
    openFilesTabs: [...getOpenDraftFiles(state)],
    openTabsQueue: [...getDraftFilesQueue(state)],
    currentFile: getCurrentDraftFile(state),
});

export function openDraftFile(
    fileName: string,
): ThunkAction<any, RootState, any, UpdateDraftFilesAction> {
    return (dispatch, getState) => {
        const {files, openFilesTabs, openTabsQueue} = getDraftFilesData(getState());

        if (!files.some(({name}) => name === fileName)) {
            return;
        }

        const index = openTabsQueue.indexOf(fileName);
        if (index > -1) {
            openTabsQueue.splice(index, 1);
            openTabsQueue.push(fileName);
        } else {
            openFilesTabs.push(fileName);
            openTabsQueue.push(fileName);
        }
        dispatch({type: UPDATE_DRAFT_FILES, data: {files, openFilesTabs, openTabsQueue}});
    };
}

export function closeDraftFiles(
    ...data: string[]
): ThunkAction<any, RootState, any, UpdateDraftFilesAction> {
    return (dispatch, getState) => {
        const {files, openFilesTabs, openTabsQueue} = getDraftFilesData(getState());
        const fileNames = new Set(data);

        dispatch({
            type: UPDATE_DRAFT_FILES,
            data: {
                files,
                openFilesTabs: openFilesTabs.filter((name) => !fileNames.has(name)),
                openTabsQueue: openTabsQueue.filter((name) => !fileNames.has(name)),
            },
        });
    };
}

export function updateDraftFileContent({
    name,
    content,
    oldName,
}: {
    name: string;
    content: string;
    oldName: string;
}): ThunkAction<any, RootState, any, UpdateDraftFilesAction> {
    return (dispatch, getState) => {
        const {files, openFilesTabs, openTabsQueue} = getDraftFilesData(getState());
        const index = files.findIndex((f) => f.name === oldName);
        if (index < 0) {
            return;
        }
        const newFile = {...files[index], content, name};
        files.splice(index, 1, newFile);
        if (oldName !== name) {
            const tabIndex = openFilesTabs.indexOf(oldName);
            if (tabIndex > -1) {
                openFilesTabs[tabIndex] = name;
                const queueIndex = openTabsQueue.indexOf(oldName);
                openTabsQueue[queueIndex] = name;
            }
        }
        dispatch({type: UPDATE_DRAFT_FILES, data: {files, openFilesTabs, openTabsQueue}});
    };
}

export function updateOpenFile(
    content: string,
): ThunkAction<any, RootState, any, UpdateDraftFilesAction> {
    return (dispatch, getState) => {
        const {files, openFilesTabs, openTabsQueue, currentFile} = getDraftFilesData(getState());
        const index = files.findIndex(({name}) => name === currentFile);
        if (index < 0) {
            return;
        }

        const newFile = {name: currentFile, content, type: files[index].type};
        files.splice(index, 1, newFile);
        dispatch({type: UPDATE_DRAFT_FILES, data: {files, openFilesTabs, openTabsQueue}});
    };
}

export function removeDraftFile(
    fileName: string,
): ThunkAction<any, RootState, any, UpdateDraftFilesAction> {
    return (dispatch, getState) => {
        const {files, openFilesTabs, openTabsQueue} = getDraftFilesData(getState());
        dispatch({
            type: UPDATE_DRAFT_FILES,
            data: {
                files: files.filter(({name}) => name !== fileName),
                openFilesTabs: openFilesTabs.filter((name) => name !== fileName),
                openTabsQueue: openTabsQueue.filter((name) => name !== fileName),
            },
        });
    };
}

export function createDraftFile(
    data: QueryFile,
): ThunkAction<any, RootState, any, UpdateDraftFilesAction> {
    return (dispatch, getState) => {
        const {files} = getDraftFilesData(getState());
        files.push(data);

        dispatch({type: UPDATE_DRAFT_FILES, data: {files}});
    };
}

export function createQueryFromTablePath(
    engine: QueryEngine,
    cluster: string,
    path: string,
    options?: {useDraft?: boolean},
): ThunkAction<
    any,
    RootState,
    any,
    | SetQueryAction
    | RequestQueryAction
    | SetQueryErrorLoadAction
    | SetQueryPatchAction
    | UpdateQueryAction
    | SetQueryReadyAction
> {
    return async (dispatch) => {
        dispatch({type: REQUEST_QUERY});
        try {
            const draft = await wrapApiPromiseByToaster(
                generateQueryFromTable(engine, {cluster, path}),
                {
                    toasterName: 'load_query',
                    skipSuccessToast: true,
                    errorTitle: 'Failed to load query',
                },
            );
            if (draft) {
                if (options?.useDraft) {
                    dispatch({
                        type: UPDATE_QUERY,
                        data: draft as QueryItem,
                    });
                    dispatch({type: SET_QUERY_READY});
                } else {
                    dispatch({
                        type: SET_QUERY,
                        data: {
                            initialQuery: draft as QueryItem,
                        },
                    });
                }
            } else {
                dispatch(createEmptyQuery(engine));
            }
        } catch (e) {
            dispatch(createEmptyQuery(engine));
        }
    };
}

export function createEmptyQuery(
    engine = QueryEngine.YQL,
    query?: string,
    settings?: Record<string, string>,
): ThunkAction<any, RootState, any, SetQueryAction> {
    return (dispatch) => {
        dispatch({
            type: SET_QUERY,
            data: {
                initialQuery: {
                    query: query || '',
                    engine,
                    settings: settings || {},
                } as QueryItem,
            },
        });
    };
}

export function runQuery(
    afterCreate?: (query_id: string) => boolean | void,
): ThunkAction<any, RootState, any, SetQueryAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const query = getQueryDraft(state);
        const {query_id} = await wrapApiPromiseByToaster(dispatch(startQuery(query)), {
            toasterName: 'start_query',
            skipSuccessToast: true,
            errorTitle: 'Failed to start query',
        });
        const handled = afterCreate?.(query_id);
        if (!handled) {
            dispatch(loadQuery(query_id));
        }
        dispatch(requestQueriesList());
    };
}

export function abortCurrentQuery(): ThunkAction<any, RootState, any, SetQueryAction> {
    return async (dispatch, getState) => {
        const state = getState();
        const currentQuery = getCurrentQuery(state);
        if (currentQuery) {
            await wrapApiPromiseByToaster(dispatch(abortQuery({query_id: currentQuery?.id})), {
                toasterName: 'abort_query',
                skipSuccessToast: true,
                errorTitle: 'Failed to abort query',
            });
            dispatch(loadQuery(currentQuery?.id));
            dispatch(requestQueriesList());
        }
    };
}

export function goToQuery(query_id: string): ThunkAction<any, RootState, any, never> {
    return (_, getState) => {
        const state = getState();
        const cluster = getCluster(state);
        const history = getAppBrowserHistory();
        history.push(createQueryUrl(cluster, query_id));
    };
}
