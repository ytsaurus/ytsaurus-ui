import {test} from '@playwright/test';
import {CLUSTER, makeClusterUrl} from '../utils';

test('Tablet Cell Bundles - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('tablet_cell_bundles/tablet_cells?activeBundle=default'));

    await page.waitForSelector(
        `a:text("My monitoring")[href="https://my.monitoring.service/bundles?cluster=${CLUSTER}&bundle=default"]`,
    );
});
