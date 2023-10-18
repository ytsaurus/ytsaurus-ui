import {expect, test} from '@playwright/test';
import {makeClusterTille, makeClusterUrl} from '../utils';

test('Bundles', async ({page}) => {
    await page.goto(makeClusterUrl('tablet_cell_bundles'));

    await page.waitForSelector('.bundles-table :text("default")');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Bundles'}));
    await expect(page).toHaveURL(makeClusterUrl('tablet_cell_bundles'));
});

test('Bundles: shortname', async ({page}) => {
    const url = makeClusterUrl(`tablet_cell_bundles/tablet_cells`);
    await page.goto(url);

    const host = await page.waitForSelector('.cells-table__td_col_peeraddress .yt-host a');
    const textContent = await host.textContent();
    const [local, port] = textContent?.split(':') ?? [];

    expect(local).toBe('local');
    expect(/^\d\d$/.test(port)).toBe(true);
});
