import {
    ListOperationEventsParameters,
    ListOperationEventsResponse,
} from '../../../../../shared/yt-types';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';

export async function listOperationEvents(args: ListOperationEventsParameters) {
    try {
        const data = (await ytApiV4Id.listOperationEvents(
            YTApiId.listOperationEvents,
            args,
        )) as ListOperationEventsResponse;

        return {data};
    } catch (error) {
        return {error};
    }
}
