import {dashboardApi} from '..';
import {paths} from './paths';

export const navigationWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        paths: build.query({
            queryFn: paths,
        }),
    }),
});

export const {usePathsQuery} = navigationWidgetApi;
