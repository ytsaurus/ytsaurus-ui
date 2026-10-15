import type {ThunkAction} from 'redux-thunk';
import type {AnyAction} from 'redux';

import type {RootState} from '../../reducers';
import type {QueryItem} from '../../../types/query-tracker/api';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {JSONSerializer} from '../../../common/yt-api';
import {
    selectQueryDraft,
    selectQueryItem,
    selectQueryTrackerRequestOptions,
} from '../../selectors/query-tracker/query';
import {
    SET_QUERY_PATCH,
    UPDATE_QUERY_ITEM,
} from '../../reducers/query-tracker/query-tracker-contants';
import {getQTApiSetup} from './api';
import {updateQueryInList} from './queriesList';

// A title edit and a chart save must read and write annotations in the same queue.
const pendingUpdates = new Map<string, Promise<void>>();

export function saveQueryAnnotations(
    queryId: string,
    prepareAnnotations: (query: QueryItem) => QueryItem['annotations'],
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return (dispatch, getState) => {
        const {stage} = selectQueryTrackerRequestOptions(getState());
        const setup = getQTApiSetup();
        const key = JSON.stringify([setup.proxy, stage, queryId]);
        const previous = pendingUpdates.get(key) || Promise.resolve();
        const request = previous
            .catch(() => undefined)
            .then(async () => {
                // Capture the target before queueing; navigation cannot redirect this update.
                const query: QueryItem = await ytApiV4Id.getQuery(YTApiId.getQuery, {
                    parameters: {stage, query_id: queryId, output_format: 'json'},
                    setup: {...setup, JSONSerializer},
                });
                const annotations = prepareAnnotations(query);
                await ytApiV4Id.alterQuery(YTApiId.alterQuery, {
                    parameters: {stage, query_id: queryId, annotations},
                    setup,
                });
                const state = getState();
                if (
                    selectQueryTrackerRequestOptions(state).stage !== stage ||
                    getQTApiSetup().proxy !== setup.proxy
                )
                    return;

                dispatch(updateQueryInList(queryId, {annotations}));
                const current = selectQueryItem(state);
                if (current?.id === queryId) {
                    dispatch({type: UPDATE_QUERY_ITEM, data: {...current, annotations}});
                }
                if (selectQueryDraft(state).id === queryId) {
                    dispatch({type: SET_QUERY_PATCH, data: {annotations}});
                }
            });
        pendingUpdates.set(key, request);
        const cleanup = () => {
            if (pendingUpdates.get(key) === request) pendingUpdates.delete(key);
        };
        request.then(cleanup, cleanup);
        return request;
    };
}

export function setQueryName(queryId: string, title: string | undefined) {
    return saveQueryAnnotations(queryId, (query) => ({...query.annotations, title}));
}
