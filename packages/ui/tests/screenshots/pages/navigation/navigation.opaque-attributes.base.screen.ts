import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {replaceInnerHtml} from '../../../utils/dom';
import {navigationPage} from '../../../widgets/NavigationPage';
import {waitForStoreWithoutActions} from '../../../utils/store';

test('Navigation - opaque attributes', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=attributes&path=${E2E_DIR}`));

    await page.locator('.gt-table__cell_id_content');
    await waitForStoreWithoutActions(page); // wait for virtualization to settle

    await page.mouse.wheel(0, 1000);
    await page.waitForSelector('.g-ru-table__row_key_opaque_attribute_keys');

    const loadButton = await page.locator(
        '.g-ru-table__row_key_opaque_attribute_keys [data-qa="load-button"]',
    );
    await loadButton.waitFor({state: 'visible'});
    await loadButton.click();
    await loadButton.waitFor({state: 'hidden'});

    await waitForStoreWithoutActions(page); // wait for virtualization to settle
    await replaceInnerHtml(page, {'.g-ru-cell__value': '###'});
    await navigationPage(page).replaceBreadcrumbsTestDir();
    await expect(page).toHaveScreenshot();
});
