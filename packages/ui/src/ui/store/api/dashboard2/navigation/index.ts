import {dashboardApi} from '..';
import {fetchPaths} from './paths';

export const navigationWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        paths: build.query({
            queryFn: fetchPaths,
        }),
    }),
});

export const {usePathsQuery} = navigationWidgetApi;
