import {type YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {type GetParams} from '../../../../../shared/yt-types';
import {ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {type YTEndpointApiArgs} from '../types';

export async function get<T>({
    id,
    ...args
}: YTEndpointApiArgs<GetParams> & {
    id: YTApiIdType;
}) {
    try {
        const response = await ytApiV4Id.get<T>(id, args);
        return {data: response.value};
    } catch (error) {
        return {error};
    }
}
