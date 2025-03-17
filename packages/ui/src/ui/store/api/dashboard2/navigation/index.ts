import {rootApi} from '../../../../store/api';
import {paths} from './paths';

export const navigationWidgetApi = rootApi.injectEndpoints({
    endpoints: (build) => ({
        paths: build.query({
            queryFn: paths,
        }),
    }),
});

export const {usePathsQuery} = navigationWidgetApi;
