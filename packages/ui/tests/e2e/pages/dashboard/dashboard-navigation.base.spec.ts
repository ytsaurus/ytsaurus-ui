import {expect, test} from '@playwright/test';
import {E2E_DIR} from '../../../utils';
import {checkWidgetContains, setupDashboard} from './utils';

test('Dashboard - Check favourite paths', async ({page}) => {
    await setupDashboard(page);

    const widgetFavourite = page.locator(`#navigation input[value="favourite"]`);
    await widgetFavourite.click();

    const navigation = page.locator(`#navigation .yt-navigation-widget-content__navigation-item`);
    await navigation.waitFor({state: 'visible'});

    await page.waitForSelector(
        '#navigation .yt-navigation-widget-content__navigation-item .g-link',
    );

    const lines = await navigation.count();
    const items = await page.locator(`[data-qa="navigation-items-count"]`).innerText();
    expect(lines).toBe(Number(items));

    await checkWidgetContains(page, 'navigation', String(E2E_DIR));
});
