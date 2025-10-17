import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../utils';

test('Operation: checking details and attributes encoding errors', async ({page}) => {
    await page.goto(makeClusterUrl('operations?user=root&state=completed&type=map'));
    await page.click('.g-link:has-text("YQL operation ( by root)")');

    await page.waitForSelector('.operation-details__description');

    // check description meta table
    const cyrillicValue = await page.locator('.meta-table-item__value_key_yql_test_cyr');
    await expect(cyrillicValue).toHaveText('"Привет"');

    // check attributes tab
    await page.locator('.operation-detail__tabs li:has(a:has-text("Attributes"))').click();
    await page.waitForSelector('.yt-data-table');
});

const EXPECTED_TITLE =
    'YQL operation (501 - 🚧 - 5 - try to join ozon, 68f0b53b787fdd313c1e780c by mied) тест';
test('Operation: check title encoding errors', async ({page}) => {
    await page.goto(makeClusterUrl('operations?user=root&state=completed&type=vanilla'));
    await page.click(`.g-link:has-text("${EXPECTED_TITLE}")`);

    const textWithSmile = await page.locator('.operation-detail__header-title');
    await expect(textWithSmile).toHaveText(`"${EXPECTED_TITLE}"`);
});
