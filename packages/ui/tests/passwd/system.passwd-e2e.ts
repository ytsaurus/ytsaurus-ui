import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../utils';
import {prometheus} from '../widgets/Prometheus';

test('Prometheus - System data nodes common', async ({page}) => {
    await page.clock.setFixedTime(new Date());

    const dataNodes = page.getByRole('radio', {name: 'Data nodes common', exact: true});

    await test.step('Select data nodes and load charts with the default host', async () => {
        await page.goto(makeClusterUrl('system/monitoring'));
        await dataNodes.check();

        await expect(page).toHaveURL(/pdType=data-nodes-common/);
        await expect(page.getByText('Versions', {exact: true})).toBeVisible();
        await prometheus(page).waitForChart();
    });

    await test.step('Keep the selected dashboard after reload', async () => {
        await page.reload();

        await expect(dataNodes).toBeChecked();
        await expect(page.getByText('Versions', {exact: true})).toBeVisible();
        await prometheus(page).waitForChart();
    });
});
