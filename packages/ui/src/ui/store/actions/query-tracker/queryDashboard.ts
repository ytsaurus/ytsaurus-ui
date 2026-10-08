import type {ThunkAction} from 'redux-thunk';
import type {AnyAction} from 'redux';

import type {RootState} from '../../reducers';
import type {QueryItem} from '../../../types/query-tracker/api';
import type {ResultDashboardConfig} from '../../../types/query-tracker/dashboardCharts';
import {YTApiId, ytApiV4Id} from '../../../rum/rum-wrap-api';
import {JSONSerializer} from '../../../common/yt-api';
import {selectCurrentUserName} from '../../selectors/global/username';
import {
    selectQueryItem,
    selectQueryTrackerRequestOptions,
} from '../../selectors/query-tracker/query';
import {
    SET_QUERY_PATCH,
    UPDATE_QUERY_ITEM,
} from '../../reducers/query-tracker/query-tracker-contants';
import {updateDashboardResult} from '../../../utils/query-tracker/dashboardCharts';
import {updateQueryInList} from './queriesList';
import {getQTApiSetup} from './api';

// Serialize saves across result tabs. Each operation reads fresh annotations so it also
// preserves the legacy chartConfig and unrelated metadata written before this operation.
const pendingSaves = new Map<string, Promise<void>>();

export function saveQueryDashboardConfig(
    queryId: string,
    resultIndex: number,
    result: ResultDashboardConfig,
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return (dispatch, getState) => {
        const {stage} = selectQueryTrackerRequestOptions(getState());
        const setup = getQTApiSetup();
        const user = selectCurrentUserName(getState());
        const key = JSON.stringify([setup.proxy, stage, queryId]);
        const previous = pendingSaves.get(key) || Promise.resolve();
        const request = previous
            .catch(() => undefined)
            .then(async () => {
                // Capture the target before queueing; switching queries/clusters cannot redirect a save.
                const query: QueryItem = await ytApiV4Id.getQuery(YTApiId.getQuery, {
                    parameters: {stage, query_id: queryId, output_format: 'json'},
                    setup: {...setup, JSONSerializer},
                });
                if (query.user !== user)
                    throw new Error('Only the query author can save chart settings');
                const annotations = {
                    ...query.annotations,
                    dashboardChartsConfig: updateDashboardResult(
                        query.annotations?.dashboardChartsConfig,
                        resultIndex,
                        result,
                    ),
                };
                await ytApiV4Id.alterQuery(YTApiId.alterQuery, {
                    parameters: {stage, query_id: queryId, annotations},
                    setup,
                });
                const current = selectQueryItem(getState());
                const currentStage = selectQueryTrackerRequestOptions(getState()).stage;
                if (currentStage === stage && getQTApiSetup().proxy === setup.proxy) {
                    dispatch(updateQueryInList(queryId, {annotations}));
                    if (current?.id === queryId) {
                        dispatch({type: UPDATE_QUERY_ITEM, data: {...current, annotations}});
                        dispatch({type: SET_QUERY_PATCH, data: {annotations}});
                    }
                }
            });
        pendingSaves.set(key, request);
        const cleanup = () => {
            if (pendingSaves.get(key) === request) pendingSaves.delete(key);
        };
        // Attach both handlers without creating an unhandled rejected promise.
        request.then(cleanup, cleanup);
        return request;
    };
}
