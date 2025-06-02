import {rootApi} from '../../../../store/api';

import {fetchPools} from './pools';

const poolsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        pools: build.query({
            queryFn: fetchPools,
        }),
    }),
});

export const {usePoolsQuery} = poolsWidgetApi;
