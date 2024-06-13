import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {navigationPage} from './NavigationPage';

test('Navigation: map_node - Content', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}`));

    await navigationPage(page).replaceMapNodeDateTimes(8);
    await navigationPage(page).replaceMapNodeAccounts(8);
    await navigationPage(page).replaceBreadcrumbsTestDir();
    await navigationPage(page).replaceDyntableSize();

    await expect(page).toHaveScreenshot();
});

test('Navigation: map_node - Attributes', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?navmode=attributes&path=${E2E_DIR}`));

    await navigationPage(page).replaceAttributes();
    await navigationPage(page).replaceBreadcrumbsTestDir();

    await expect(page).toHaveScreenshot();
});

test('Navigation: map_node - ACL', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?navmode=acl&path=${E2E_DIR}`));

    await navigationPage(page).waitForACL();
    await navigationPage(page).replaceBreadcrumbsTestDir();

    await expect(page).toHaveScreenshot();
});

test('Navigation - Locks', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?navmode=locks&path=${E2E_DIR}/locked`));

    await navigationPage(page).replaceLocksContent();

    await expect(page).toHaveScreenshot();
});
