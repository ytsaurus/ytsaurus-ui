import {YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {GetParams} from '../../../../../shared/yt-types';
import {ytApiV4Id} from '../../../../rum/rum-wrap-api';
import {YTEndpointApiArgs} from '../types';

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
