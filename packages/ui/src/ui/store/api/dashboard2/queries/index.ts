import {rootApi} from '../../../../store/api';

import {list} from './queries';

const queriesWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        list: build.query({
            queryFn: list,
        }),
    }),
});

export const {useListQuery: useListQueries} = queriesWidgetApi;
