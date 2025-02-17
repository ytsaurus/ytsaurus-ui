import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../utils';

test('System: check short name', async ({page}) => {
    const url = makeClusterUrl(`system/general`);
    await page.goto(url);

    const masterContainer = await page.waitForSelector('.system-master');
    await page.evaluate((container) => {
        if (!container.classList.contains('system-master_open')) {
            const button = container.querySelector<HTMLSpanElement>('.collapsible-section__title');
            if (button) button.click();
        }
    }, masterContainer);

    const mastersNameElements = await page.$$('.master-group__host-name');
    const firstMasterName = await mastersNameElements[0].innerText();
    expect(firstMasterName).toEqual('local');
});
