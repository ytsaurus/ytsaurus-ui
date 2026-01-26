import {expect, test} from '@playwright/test';
import {MOCK_DATE, makeClusterUrl} from '../../../utils';
import {basePage} from '../../../widgets/BasePage';

test('Settings: checking the functionality of the menu', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl('path-viewer'));
    await page.waitForSelector('.gn-aside-header__footer');

    await basePage(page).settingsToggleVisibility();

    await test.step('General', async () => {
        await page.getByTestId('/General');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Table', async () => {
        await basePage(page).settingsShowSection('Table');
        await page.getByTestId('/Table');
        await expect(page).toHaveScreenshot();
    });
});
