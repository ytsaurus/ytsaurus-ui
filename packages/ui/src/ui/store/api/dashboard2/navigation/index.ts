import {dashboardApi} from '..';
import {fetchPaths} from './paths';
import {YTApiId} from '../../../../../shared/constants/yt-api-id';

export const navigationWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        paths: build.query({
            queryFn: fetchPaths,
            providesTags: (_result, _error, arg) => [
                String(YTApiId.navigationDashboard) + String(arg.id),
            ],
        }),
    }),
});

export const {usePathsQuery} = navigationWidgetApi;
