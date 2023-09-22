import {test, expect} from '@playwright/test';
import {makeClusterUrl} from '../utils';

test('Bundles: shortname', async ({page}) => {
    const url = makeClusterUrl(`tablet_cell_bundles/tablet_cells`);
    await page.goto(url);

    const host = await page.waitForSelector('.cells-table__td_col_peeraddress .yt-host a');
    const textContent = await host.textContent();
    const [local, port] = textContent?.split(':') ?? [];

    expect(local).toBe('local');
    expect(/^\d\d$/.test(port)).toBe(true);
});
