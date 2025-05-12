import {rootApi} from '../../../../store/api';

import {pools} from './pools';

const poolsWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        pools: build.query({
            queryFn: pools,
        }),
    }),
});

export const {usePoolsQuery} = poolsWidgetApi;
