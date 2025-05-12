import {rootApi} from '..';

import {chytFetch} from './endpoints';

export const chytApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        chytFetch: build.query({
            queryFn: chytFetch,
        }),
    }),
});

export const {useChytFetchQuery} = chytApi;
