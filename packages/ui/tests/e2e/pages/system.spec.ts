import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../utils';

test('System: check short name', async ({page}) => {
    const url = makeClusterUrl(`system/general`);
    await page.goto(url);

    await page.waitForSelector('.system');
    await page.evaluate(() => {
        const allMastersContainer = document.querySelector('.system-master__all-masters');
        if (!allMastersContainer) {
            const button = document.querySelector<HTMLSpanElement>('.collapsible-section__title');
            if (button) button.click();
        }
    });

    const mastersNameElements = await page.$$('.master-group__host-name');
    const firstMasterName = await mastersNameElements[0].innerText();
    expect(firstMasterName).toEqual('local');
});
