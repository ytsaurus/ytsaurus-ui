import {type Request as PlaywrightRequest} from '@playwright/test';
import {http} from 'msw';

import {YT_API_REQUEST_ID_HEADER} from '../../../shared/constants';
import {test as base, expect} from './index';
import {mockSettings} from './mockSettings';

import {type YTApiParameters, parseYTApiParameters} from './ytApiParameters';

type YTApiRequest = {id: string | null; parameters: YTApiParameters};

export const test = base.extend<{
    settings: Record<string, unknown>;
    ytApiRequests: YTApiRequest[];
}>({
    settings: [{}, {option: true}],
    ytApiRequests: [
        async ({page, router, settings}, use) => {
            const requests: YTApiRequest[] = [];
            const unexpected: YTApiRequest[] = [];
            const record = (request: PlaywrightRequest) => {
                if (new URL(request.url()).pathname.startsWith('/api/v3/')) {
                    const headers = request.headers();
                    requests.push({
                        id: headers[YT_API_REQUEST_ID_HEADER.toLowerCase()] ?? null,
                        parameters: parseYTApiParameters(headers, request.postDataJSON() ?? {}),
                    });
                }
            };
            page.on('request', record);
            await router.use(
                mockSettings(settings),
                http.all('*/api/v3/*', async ({request}) => {
                    unexpected.push({
                        id: request.headers.get(YT_API_REQUEST_ID_HEADER),
                        parameters: parseYTApiParameters(
                            Object.fromEntries(request.headers),
                            request.method === 'POST' ? await request.json() : {},
                        ),
                    });
                    return Response.json({message: 'Unexpected YT API request'}, {status: 500});
                }),
            );
            await use(requests);
            page.off('request', record);
            expect(
                unexpected,
                'Unexpected YT API requests: register a mock for each request',
            ).toEqual([]);
        },
        {auto: true},
    ],
});

export {expect} from './index';
