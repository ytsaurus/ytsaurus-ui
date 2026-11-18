import type {ThunkAction} from 'redux-thunk';
import type {AnyAction} from 'redux';

import type {RootState} from '../../reducers';
import type {QueryItem} from '../../../types/query-tracker/api';
import {mergeQueryAnnotations} from '../../../utils/query-tracker/mergeQueryAnnotations';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {JSONSerializer} from '../../../common/yt-api';
import {
    selectQueryDraft,
    selectQueryItem,
    selectQuerySessionRevision,
    selectQueryTrackerRequestOptions,
} from '../../selectors/query-tracker/query';
import {
    SET_QUERY_PATCH,
    UPDATE_QUERY_ITEM,
} from '../../reducers/query-tracker/query-tracker-contants';
import {getQTApiSetup} from './api';
import {updateQueryInList} from './queriesList';

const pendingUpdates = new Map<string, Promise<void>>();

export function saveQueryAnnotations(
    queryId: string,
    patchOrPrepare: QueryItem['annotations'] | ((query: QueryItem) => QueryItem['annotations']),
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return (dispatch, getState) => {
        const stateAtEnqueue = getState();
        const draftSnapshot = selectQueryDraft(stateAtEnqueue);
        const sessionRevision = selectQuerySessionRevision(stateAtEnqueue);
        const {stage} = selectQueryTrackerRequestOptions(stateAtEnqueue);
        const setup = getQTApiSetup();
        const key = JSON.stringify([setup.proxy, stage, queryId]);
        const previous = pendingUpdates.get(key);

        async function persistAnnotations() {
            try {
                await previous;
            } catch {
                // A failed save must not block subsequent updates.
            }

            const query: QueryItem = await ytApiV4Id.getQuery(YTApiId.getQuery, {
                parameters: {stage, query_id: queryId, output_format: 'json'},
                setup: {...setup, JSONSerializer},
            });
            const patch =
                typeof patchOrPrepare === 'function' ? patchOrPrepare(query) : patchOrPrepare;
            const annotations = {...query.annotations, ...patch};
            await ytApiV4Id.alterQuery(YTApiId.alterQuery, {
                parameters: {stage, query_id: queryId, annotations},
                setup,
            });

            const currentState = getState();
            if (
                selectQueryTrackerRequestOptions(currentState).stage !== stage ||
                getQTApiSetup().proxy !== setup.proxy
            ) {
                return;
            }

            dispatch(updateQueryInList(queryId, {annotations}));
            const currentQuery = selectQueryItem(currentState);
            if (currentQuery?.id === queryId) {
                dispatch({type: UPDATE_QUERY_ITEM, data: {...currentQuery, annotations}});
            }

            const currentDraft = selectQueryDraft(currentState);
            if (
                currentDraft.id !== queryId ||
                draftSnapshot.id !== queryId ||
                selectQuerySessionRevision(currentState) !== sessionRevision
            ) {
                return;
            }

            const merged = mergeQueryAnnotations({
                saved: annotations,
                previouslySaved: currentQuery?.annotations,
                snapshot: draftSnapshot.annotations,
                current: currentDraft.annotations,
                patch,
            });
            dispatch({
                type: SET_QUERY_PATCH,
                data: {annotations: merged},
            });
        }

        const request = persistAnnotations();
        pendingUpdates.set(key, request);
        const cleanup = () => {
            if (pendingUpdates.get(key) === request) pendingUpdates.delete(key);
        };
        request.then(cleanup, cleanup);
        return request;
    };
}

export function setQueryName(queryId: string, title: string | undefined) {
    return saveQueryAnnotations(queryId, {title});
}
