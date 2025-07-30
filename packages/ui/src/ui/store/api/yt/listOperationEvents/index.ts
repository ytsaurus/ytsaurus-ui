import {ListOperationEventsParameters} from '../../../../../shared/yt-types';
import type {RootState} from '../../../../store/reducers';
import {ytApi} from '../ytApi';
import {listOperationEvents} from './endpoint';

export const listOperationEventsApi = ytApi.injectEndpoints({
    endpoints: (build) => ({
        listOperationEvents: build.query({
            queryFn: listOperationEvents,
        }),
    }),
});

export const getOperationEvents = (
    state: RootState,
    {operation_id, event_type}: ListOperationEventsParameters,
) => listOperationEventsApi.endpoints.listOperationEvents.select({operation_id, event_type})(state);

export const {useListOperationEventsQuery} = listOperationEventsApi;
