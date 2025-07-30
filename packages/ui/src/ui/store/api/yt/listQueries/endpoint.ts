import {ListQueriesParams} from '../../../../../shared/yt-types';
import {YTApiId, ytApiV4Id} from '../../../../rum/rum-wrap-api';

export async function listQueries(args: ListQueriesParams) {
    try {
        const response = await ytApiV4Id.listQueries(YTApiId.listQueries, args);
        return {data: response};
    } catch (error) {
        return {error};
    }
}
