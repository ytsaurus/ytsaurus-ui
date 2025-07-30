import {YTApiId} from '../../../../rum/rum-wrap-api';

import {ytApi} from '../baseYTApi';
import {listQueries} from './endpoint';

export const listQueriesApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        listQueries: build.query({
            queryFn: listQueries,
            providesTags: (_result, _error, _arg) => [String(YTApiId.listQueries)],
        }),
    }),
});

export const {useListQueriesQuery} = listQueriesApi;
