import {test} from '@playwright/test';
import {E2E_SUFFIX} from '../../../utils';
import {
    checkCountInCustom,
    checkCountInFavourite,
    checkWidgetContains,
    enableEditMode,
    openSettings,
    saveEdit,
    setupDashboard,
    submitSettings,
} from './utils';

test('Dashboard - Edit accounts widget', async ({page}) => {
    await setupDashboard(page);

    await enableEditMode(page);
    await openSettings(page, 'accounts');

    await test.step('Set usable accounts', async () => {
        const usablePreset = page.locator("button:has-text('Usable')");
        await usablePreset.click();
    });

    await submitSettings(page);
    await saveEdit(page);

    await checkCountInCustom(page, 'accounts');
});

test('Dashboard - Check default favourite accounts', async ({page}) => {
    await setupDashboard(page);
    await page.waitForSelector('#accounts .gt-table');
    await checkCountInFavourite(page, 'accounts', {equal: 2});
    await checkWidgetContains(page, 'accounts', `e2e-overcommit-${E2E_SUFFIX}`);
    await checkWidgetContains(page, 'accounts', `e2e-parent-${E2E_SUFFIX}`);
});
