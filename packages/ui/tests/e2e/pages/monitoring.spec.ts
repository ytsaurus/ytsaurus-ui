import {expect, test} from '@playwright/test';
import {CLUSTER, E2E_OPERATION_ID, E2E_OPERATION_2_ID, makeClusterUrl} from '../utils';

test('Accounts - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general?account=account-for-e2e'));

    await page.waitForSelector(
        `a:text("My monitoring")[href="https://my.monitoring.service/accounts?cluster=${CLUSTER}&account=account-for-e2e"]`,
    );
});

test('Scheduling - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('scheduling/overview?pool=yt-e2e-pool-1&tree=default'));

    await page.waitForSelector('text="yt-e2e-pool-1"');
    await page.waitForSelector(
        `a:text("My monitoring")[href="https://monitoring-service.my-domain.com/d/DB-id?var-pool=yt-e2e-pool-1&var-cluster=${CLUSTER}&var-tree=default"]`,
    );
});

test('Operations - Monitoring for one pool', async ({page}) => {
    await page.goto(makeClusterUrl(`operations/${E2E_OPERATION_ID}`));

    await page.waitForSelector(
        `a:text("My monitoring")[href^="https://my.monitoring.service/operations?cluster=${CLUSTER}&id=${E2E_OPERATION_ID}&pool=root&tree=default&from="]`,
    );
});

test('Operations - Monitoring two pools ', async ({page}) => {
    await page.goto(makeClusterUrl(`operations/${E2E_OPERATION_2_ID}`));

    await page.click('.tabs :text("Monitoring")');

    await page.waitForSelector(
        `a:text("My monitoring")[href^="https://my.monitoring.service/operations?cluster=${CLUSTER}&id=${E2E_OPERATION_2_ID}&pool=root&tree=default&from="]`,
    );

    await page.waitForSelector(
        `a:text("My monitoring")[href^="https://my.monitoring.service/operations?cluster=${CLUSTER}&id=${E2E_OPERATION_2_ID}&pool=test-e2e&tree=e2e&from="]`,
    );
});

test('Tablet Cell Bundles - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('tablet_cell_bundles/tablet_cells?activeBundle=default'));

    await page.waitForSelector(
        `a:text("My monitoring")[href="https://my.monitoring.service/bundles?cluster=${CLUSTER}&bundle=default"]`,
    );
});
