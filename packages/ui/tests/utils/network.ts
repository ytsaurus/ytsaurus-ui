import {type Page} from '@playwright/test';
import mergeWith from 'lodash/mergeWith';

export const mockYTApi = async (
    page: Page,
    ytApiId: string,
    patchToMerge: unknown,
    {arrays = 'merge'}: {arrays?: 'merge' | 'replace'} = {},
) => {
    await page.route(`**/api/yt/*/api/**`, async (route) => {
        const {'x-custom-request-id': customApiId} = await route.request().allHeaders();
        if (customApiId !== ytApiId) {
            return await route.continue();
        }

        const response = await route.fetch();
        const json = await response.json();
        // Wrap the response to apply the customizer to top-level arrays too.
        const {data} = mergeWith({data: json}, {data: patchToMerge}, (_target, source) => {
            if (arrays === 'replace' && Array.isArray(source)) {
                return source;
            }
            return undefined;
        });

        await route.fulfill({response, json: data});
    });
};
