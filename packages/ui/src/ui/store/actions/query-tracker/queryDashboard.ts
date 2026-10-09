import type {ThunkAction} from 'redux-thunk';
import type {AnyAction} from 'redux';

import type {RootState} from '../../reducers';
import type {ResultDashboardConfig} from '../../../types/query-tracker/dashboardCharts';
import {selectCurrentUserName} from '../../selectors/global/username';
import {updateDashboardResult} from '../../../utils/query-tracker/dashboardCharts';
import {saveQueryAnnotations} from './queryAnnotations';

export function saveQueryDashboardConfig(
    queryId: string,
    resultIndex: number,
    result: ResultDashboardConfig,
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> {
    return (dispatch, getState) => {
        const user = selectCurrentUserName(getState());
        return dispatch(
            saveQueryAnnotations(queryId, (query) => {
                if (query.user !== user) {
                    throw new Error('Only the query author can save chart settings');
                }
                return {
                    ...query.annotations,
                    dashboardChartsConfig: updateDashboardResult(
                        query.annotations?.dashboardChartsConfig,
                        resultIndex,
                        result,
                    ),
                };
            }),
        );
    };
}
