import {type YTError} from '../../../../../@types/types';
import {type YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {type CheckPermissionParams} from '../../../../../shared/yt-types';
import {ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {type YTEndpointApiArgs} from '../types';

export type Params = YTEndpointApiArgs<CheckPermissionParams> & {
    id: YTApiIdType;
};

export async function checkPermission({id, ...rest}: Params) {
    try {
        const response: {action: 'allow' | 'deny'} = await ytApiV3Id.checkPermission(id, rest);
        return {data: response};
    } catch (error) {
        return {error: error as YTError};
    }
}
