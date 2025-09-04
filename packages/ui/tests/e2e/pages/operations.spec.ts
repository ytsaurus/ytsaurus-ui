import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../utils';

test('Operation: checking encoding errors', async ({page}) => {
    await page.goto(makeClusterUrl('operations?user=root&state=completed&type=map'));

    await page.waitForSelector('.operations-list__table-item');
    await page.click('.operations-list__item-title .g-link');

    await page.waitForSelector('.operation-details__description');

    // check description meta table
    const cyrillicValue = await page.locator('.meta-table-item__value_key_yql_test_cyr');
    await expect(cyrillicValue).toHaveText('"Привет"');

    // check attributes tab
    await page.locator('.operation-detail__tabs li:has(a:has-text("Attributes"))').click();
    await page.waitForSelector('.yt-data-table');
});
