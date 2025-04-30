import {dashboardApi} from '..';
import {services} from './services';

export const servicesWidgetApi = dashboardApi.injectEndpoints({
    endpoints: (build) => ({
        services: build.query({
            queryFn: services,
        }),
    }),
});

export const {useServicesQuery} = servicesWidgetApi;
