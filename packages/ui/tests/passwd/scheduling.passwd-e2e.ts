import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../utils';
import {prometheus} from '../widgets/Prometheus';

test('Prometheus - Scheduling <Root>', async ({page}) => {
    await page.goto(makeClusterUrl(`scheduling/dashboard`));

    await prometheus(page).waitForChart();
});

test('Prometheus - Scheduling no-accwess', async ({page}) => {
    await page.goto(makeClusterUrl(`scheduling/dashboard?pool=no-access`));

    await prometheus(page).waitForError403();
});

test('Prometheus - Accounts', async ({page}) => {
    await page.goto(makeClusterUrl(`accounts/monitor?account=default`));

    await prometheus(page).waitForChart();
});
