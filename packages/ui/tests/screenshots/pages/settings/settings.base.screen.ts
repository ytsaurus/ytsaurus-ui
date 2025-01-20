import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {basePage} from '../../../utils/BasePage';

test('Settings: checking the functionality of the menu', async ({page}) => {
    await page.goto(makeClusterUrl('path-viewer'));
    await page.waitForSelector('.gn-aside-header__footer');

    await basePage(page).settingsToggleVisibility();

    await test.step('General', async () => {
        await page.waitForSelector('.gn-settings__section-heading:text("General")');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Table', async () => {
        await basePage(page).settingsShowSection('Table');
        await page.waitForSelector('.gn-settings__section-heading:text("Table")');
        await expect(page).toHaveScreenshot();
    });
});
