import {type GetOperationParams} from '../../../../../shared/yt-types';
import {type YTError} from '../../../../types';
import {type YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {type YTEndpointApiArgs} from '../types';

export type GetOperationApiArgs = YTEndpointApiArgs<GetOperationParams> & {
    id: YTApiIdType;
};

export async function getOperation({id, ...args}: GetOperationApiArgs) {
    try {
        const data = await ytApiV3Id.getOperation(id, args);
        return {data};
    } catch (error) {
        return {error: error as YTError};
    }
}
