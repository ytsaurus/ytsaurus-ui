import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {navigationPage} from '../../../widgets/NavigationPage';

test('Navigation: map_node - Content', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}`));
    await page.waitForLoadState('networkidle');

    await navigationPage(page).replaceMapNodeDateTimes(8);
    await navigationPage(page).replaceMapNodeAccounts(8);
    await navigationPage(page).replaceBreadcrumbsTestDir();
    await navigationPage(page).replaceMapNodeBytes();

    await expect(page).toHaveScreenshot();

    await test.step('Create modal', async () => {
        await navigationPage(page).mapNodeCreateObject('Table');

        await test.step('Table settings', async () => {
            await navigationPage(page).dfDialog.waitForField('Unique keys');
            await page.fill('input[name="tableSettings.name"]', '//tmp/New table');

            await page.waitForLoadState('networkidle');
            await expect(page).toHaveScreenshot();
        });

        await test.step('Column', async () => {
            await navigationPage(page).dfDialog.showTab('Column_1');
            await navigationPage(page).dfDialog.waitForField('Aggregate');

            await expect(page).toHaveScreenshot();
        });
    });
});

test('Navigation: map_node - bad-names', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/bad-names`));
    await page.waitForLoadState('networkidle');

    await navigationPage(page).replaceMapNodeDateTimes(8);
    await navigationPage(page).replaceBreadcrumbsTestDir();

    await expect(page).toHaveScreenshot();
});

test('Navigation: map_node - Attributes', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=attributes&path=${E2E_DIR}`));
    await page.waitForLoadState('networkidle');

    await navigationPage(page).replaceAttributes();
    await navigationPage(page).replaceBreadcrumbsTestDir();

    await expect(page).toHaveScreenshot();
});

test('Navigation: map_node - ACL', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=acl&path=${E2E_DIR}`));

    await navigationPage(page).waitForACL();
    await navigationPage(page).replaceBreadcrumbsTestDir();

    await expect(page).toHaveScreenshot();

    await page.click('.acl-request-permissions button');
    await navigationPage(page).replaceACLInputPath();
    await expect(page).toHaveScreenshot();
    await page.click('button[aria-label="Close dialog"]');

    await page.click('input[value="column_groups_permissions"]');
    await expect(page).toHaveScreenshot();

    await page.click('.acl-request-permissions button');
    await navigationPage(page).replaceACLInputPath();
    await expect(page).toHaveScreenshot();
});

test('Navigation - Locks', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?navmode=locks&path=${E2E_DIR}/locked`));
    await page.waitForLoadState('networkidle');

    await navigationPage(page).replaceLocksContent();

    await expect(page).toHaveScreenshot();
});

test('Navigation - map_node - select-by-first-cell', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}`));
    await page.waitForLoadState('networkidle');

    await navigationPage(page).replaceMapNodeDateTimes(8);
    await navigationPage(page).replaceMapNodeAccounts(8);
    await navigationPage(page).replaceBreadcrumbsTestDir();
    await navigationPage(page).replaceMapNodeBytes();

    await page.click('.map-node_default__table tr:nth-child(1) td:nth-child(1)', {
        force: true,
        position: {x: 1, y: 1},
    });

    await expect(page).toHaveScreenshot();
});

test('Navigation: map_node - Pipeline - flow-tab', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/pipeline`));
    await page.waitForLoadState('networkidle');

    await navigationPage(page).replaceBreadcrumbsTestDir();

    await expect(page).toHaveScreenshot();
});
