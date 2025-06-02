import {rootApi} from '../../../../store/api';

import {fetchQuerieslist} from './queries';

const queriesWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        list: build.query({
            queryFn: fetchQuerieslist,
        }),
    }),
});

export const {useListQuery: useListQueries} = queriesWidgetApi;
