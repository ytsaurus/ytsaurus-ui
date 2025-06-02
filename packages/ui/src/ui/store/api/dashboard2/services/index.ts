import {dashboardApi} from '..';
import {fetchServices} from './services';

export const servicesWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        services: build.query({
            queryFn: fetchServices,
        }),
    }),
});

export const {useServicesQuery} = servicesWidgetApi;
