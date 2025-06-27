import {YTApiId} from '../../../../rum/rum-wrap-api';
import {rootApi} from '../../../../store/api';

import {fetchPools} from './pools';

const poolsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        pools: build.query({
            queryFn: fetchPools,
            providesTags: (_result, _error, arg) => [
                String(YTApiId.poolsDashboard) + String(arg.id),
            ],
        }),
    }),
});

export const {usePoolsQuery} = poolsWidgetApi;
