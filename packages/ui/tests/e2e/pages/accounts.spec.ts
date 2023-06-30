import {test} from '@playwright/test';
import {CLUSTER, makeClusterUrl} from '../utils';

test('Accounts - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general?account=account-for-e2e'));

    await page.waitForSelector(
        `a:text("My monitoring")[href="https://my.monitoring.service/accounts?cluster=${CLUSTER}&account=account-for-e2e"]`,
    );
});
