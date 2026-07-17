import {type YTApiIdType} from '../../../../../shared/constants/yt-api-id';
import {type SelectRowsParams} from '../../../../../shared/yt-types';
import {ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {
    getParsedError,
    parseErrorFromResponse,
    prepareRows,
} from '../../../../utils/navigation/content/table/table';
import {type YTEndpointApiArgs} from '../types';

export async function selectRows({
    id,
    ...args
}: YTEndpointApiArgs<SelectRowsParams> & {
    id: YTApiIdType;
}) {
    try {
        const response = await ytApiV3Id.selectRows(id, args);
        const error = parseErrorFromResponse(response);
        if (error) {
            throw getParsedError(error);
        }
        return {data: prepareRows(response)};
    } catch (error) {
        return {error};
    }
}
