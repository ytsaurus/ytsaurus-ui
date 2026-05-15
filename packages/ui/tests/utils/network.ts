import {Page} from '@playwright/test';
import merge from 'lodash/merge';

export const mockYTApi = async (page: Page, ytApiId: string, patchToMerge: unknown) => {
    await page.route(`**/api/yt/*/api/**`, async (route) => {
        const {'x-custom-request-id': customApiId} = await route.request().allHeaders();
        if (customApiId !== ytApiId) {
            return await route.continue();
        }

        const response = await route.fetch();
        const json = await response.json();

        await route.fulfill({response, json: merge(json, patchToMerge)});
    });
};
