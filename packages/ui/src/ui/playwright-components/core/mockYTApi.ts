import {type HttpResponseResolver, http} from 'msw';
import {type YTError} from '@ytsaurus/components';

import {YT_API_REQUEST_ID_HEADER} from '../../../shared/constants';
import {type YTApiId} from '../../../shared/constants/yt-api-id';

type MockYTApiResponse =
    {data: unknown; error?: never} | {error: YTError; data?: never} | HttpResponseResolver;

export function mockYTApi(id: YTApiId, response: MockYTApiResponse) {
    return http.all('*/api/v3/*', (info) => {
        if (info.request.headers.get(YT_API_REQUEST_ID_HEADER) !== id) {
            return undefined;
        }
        if (typeof response === 'function') {
            return response(info);
        }
        if ('error' in response) {
            return Response.json(response.error, {status: 500});
        }
        return Response.json(response.data);
    });
}
