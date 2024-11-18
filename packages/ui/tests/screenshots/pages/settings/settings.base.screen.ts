import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';

test('Settings: checking the functionality of the menu', async ({page}) => {
    await page.goto(makeClusterUrl('path-viewer'));
    await page.waitForSelector('.gn-aside-header__footer');

    page.click('.gn-footer-item');
    await page.waitForSelector('.settings-panel');
    let header = await page.textContent('.gn-settings__section-heading');
    expect(header).toEqual('General');
    await expect(page).toHaveScreenshot();

    page.click('.gn-settings-menu__item[data-id="/Table"]');
    await page.waitForSelector('.gn-settings-menu__item_selected[data-id="/Table"]');
    header = await page.textContent('.gn-settings__section-heading');
    expect(header).toEqual('Table');
    await expect(page).toHaveScreenshot();
});
