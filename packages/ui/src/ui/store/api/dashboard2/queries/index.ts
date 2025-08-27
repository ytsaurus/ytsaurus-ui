import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {rootApi} from '../../../../store/api';

import {fetchQuerieslist} from './queries';

const queriesWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        list: build.query({
            queryFn: fetchQuerieslist,
            providesTags: (_result, _error, arg) => [`${YTApiId.queriesDashboard}_${arg.id}`],
        }),
    }),
});

export const {useListQuery: useListQueries} = queriesWidgetApi;
