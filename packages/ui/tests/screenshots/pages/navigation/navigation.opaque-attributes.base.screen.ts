import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {replaceInnerHtml} from '../../../utils/dom';
import {navigationPage} from '../../../widgets/NavigationPage';

test('Navigation - opaque attributes', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=attributes&path=${E2E_DIR}`));
    await page.waitForLoadState('networkidle');
    await navigationPage(page).replaceBreadcrumbsTestDir();

    await page.mouse.wheel(0, 1000);
    await page.waitForSelector('.g-ru-table__row_key_opaque_attribute_keys');

    const loadButton = await page.locator(
        '.g-ru-table__row_key_opaque_attribute_keys [data-qa="load-button"]',
    );
    await loadButton.waitFor({state: 'visible'});
    await loadButton.click();
    await loadButton.waitFor({state: 'hidden'});

    await page.waitForTimeout(1000); // wait for virtualization to settle
    await replaceInnerHtml(page, {'.g-ru-cell__value': '###'});
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot();
});
