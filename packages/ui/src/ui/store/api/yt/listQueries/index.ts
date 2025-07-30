import {YTApiId} from '../../../../rum/rum-wrap-api';

import {ytApi} from '../ytApi';
import {listQueries} from './endpoint';

export const listQueriesApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        listQueries: build.query({
            queryFn: listQueries,
            providesTags: (_result, _error, _arg) => [YTApiId.listQueries],
        }),
    }),
});

export const {useListQueriesQuery} = listQueriesApi;
