import {dashboardApi} from '..';
import {operations} from './operations';

export const operationsWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        operations: build.query({
            queryFn: operations,
        }),
    }),
});

export const {useOperationsQuery} = operationsWidgetApi;
