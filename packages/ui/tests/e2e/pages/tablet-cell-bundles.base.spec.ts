import {expect, test} from '@playwright/test';
import {makeClusterTille, makeClusterUrl} from '../utils';

test('Bundles', async ({page}) => {
    await page.goto(makeClusterUrl('tablet_cell_bundles'));

    await page.waitForSelector('.bundles-table :text("default")');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Bundles'}));
    await expect(page).toHaveURL(makeClusterUrl('tablet_cell_bundles'));
});
