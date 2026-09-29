import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {replaceInnerHtml} from '../../../utils/dom';
import {navigationPage} from '../../../widgets/NavigationPage';

test('Navigation - symlinks', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await test.step('Render symlink label', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/tmp/ссылка`));
        await page.waitForLoadState('networkidle');
        await navigationPage(page).replaceBreadcrumbsTestDir();
        const link = page.getByTestId('qa:navigation:target-path').first();
        await link.hover();
        const targetPathLink = page
            .getByRole('tooltip')
            .getByRole('link', {name: `${E2E_DIR}/tmp/папка`, exact: true});
        await expect(targetPathLink).toBeVisible();
        await replaceInnerHtml(page, {
            '.g-tooltip .meta-table-item__value_key_target_path':
                '//tmp/e2e.1970-01-01.00:00:00.xxxxxx/tmp/папка',
        });
        await link.click();
    });
    await test.step('Follow target path url', async () => {
        await page.waitForLoadState('networkidle');
        await navigationPage(page).replaceBreadcrumbsTestDir();
        await expect(page).toHaveScreenshot();
    });
});
