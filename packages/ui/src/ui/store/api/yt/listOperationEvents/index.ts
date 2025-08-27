import {ytApi} from '../baseYTApi';
import {listOperationEvents} from './endpoint';

export const listOperationEventsApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        listOperationEvents: build.query({
            queryFn: listOperationEvents,
        }),
    }),
});

export const {useListOperationEventsQuery} = listOperationEventsApi;
