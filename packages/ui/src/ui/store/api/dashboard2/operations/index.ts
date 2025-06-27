import {dashboardApi} from '..';
import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {fetchOperations} from './operations';

export const operationsWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        operations: build.query({
            queryFn: fetchOperations,
            providesTags: (_result, _error, arg) => [
                String(YTApiId.operationsDashboard) + String(arg.id),
            ],
        }),
    }),
});

export const {useOperationsQuery} = operationsWidgetApi;
