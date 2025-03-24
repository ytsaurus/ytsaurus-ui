import {rootApi} from '../../../../store/api';
import {operations} from './operations';

export const operationsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        operations: build.query({
            queryFn: operations,
        }),
    }),
});

export const {useOperationsQuery} = operationsWidgetApi;
