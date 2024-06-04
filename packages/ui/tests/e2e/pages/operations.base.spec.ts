import {expect, test} from '@playwright/test';
import {makeClusterTille, makeClusterUrl} from '../../utils';

test('Operations list', async ({page}) => {
    await page.goto(makeClusterUrl('operations?user=unknown&state=running'));

    await page.waitForSelector('.operations-list :text("No items to show")');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Operations'}));
    await expect(page).toHaveURL(makeClusterUrl('operations?user=unknown&state=running'));
});
