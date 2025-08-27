import {dashboardApi} from '..';
import {YTApiId} from '../../../../../shared/constants/yt-api-id';
import {fetchServices} from './services';

export const servicesWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        services: build.query({
            queryFn: fetchServices,
            providesTags: (_result, _error, arg) => [`${YTApiId.servicesDashboard}_${arg.id}`],
        }),
    }),
});

export const {useServicesQuery} = servicesWidgetApi;
