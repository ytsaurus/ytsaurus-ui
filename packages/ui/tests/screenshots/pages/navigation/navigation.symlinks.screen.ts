import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {navigationPage} from './NavigationPage';

test('Navigation - symlinks', async ({page}) => {
    await test.step('Render link-button', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/tmp/ссылка`));
        await page.waitForLoadState('networkidle');
        await navigationPage(page).replaceBreadcrumbsTestDir();
        const link = page.getByTestId('qa:navitation:target-path');
        await link.hover();
        await page.waitForSelector(
            `.meta-table-item__value_key_target_path:text("${E2E_DIR}/tmp/папка")`,
        );
        page.mouse.move(0, 0);
        await expect(page).toHaveScreenshot();
        await link.click();
    });
    await test.step('Follow target path url', async () => {
        await page.waitForLoadState('networkidle');
        await navigationPage(page).replaceBreadcrumbsTestDir();
        await expect(page).toHaveScreenshot();
    });
});
