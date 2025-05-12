import {dashboardApi} from '..';
import {fetchOperations} from './operations';

export const operationsWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        operations: build.query({
            queryFn: fetchOperations,
        }),
    }),
});

export const {useOperationsQuery} = operationsWidgetApi;
