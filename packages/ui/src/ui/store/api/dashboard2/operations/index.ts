import {dashboardApi} from '..';
import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {fetchOperations} from './operations';

export const operationsWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        operations: build.query({
            queryFn: fetchOperations,
            providesTags: (_result, _error, arg) => [`${YTApiId.operationsDashboard}_${arg.id}`],
        }),
    }),
});

export const {useOperationsQuery} = operationsWidgetApi;
