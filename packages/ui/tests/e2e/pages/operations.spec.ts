import {test} from '@playwright/test';
import {CLUSTER, E2E_OPERATION_ID, E2E_OPERATION_2_ID, makeClusterUrl} from '../utils';

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
