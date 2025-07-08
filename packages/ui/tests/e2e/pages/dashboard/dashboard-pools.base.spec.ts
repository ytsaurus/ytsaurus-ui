import {test} from '@playwright/test';
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

test('Dashboard - Make custom list for pools', async ({page}) => {
    await setupDashboard(page);

    await enableEditMode(page);
    await openSettings(page, 'pools');

    await test.step('Setup pools widget', async () => {
        const treeSelect = page.locator('.g-select:has-text("Select tree")');
        const poolSelect = page.locator('.g-select:has-text("Select pool")');

        await treeSelect.click();
        const defaultTreeOption = page.locator('.g-select-list__option:has-text("default")');
        await defaultTreeOption.click();

        await poolSelect.click();
        const rootPoolOption = page.locator('.g-select-list__option:has-text("<Root>")');
        await rootPoolOption.click();

        await submitSettings(page);
    });

    await saveEdit(page);

    await checkCountInCustom(page, 'pools');
});

test('Dashboard - Check default favourite pools', async ({page}) => {
    await setupDashboard(page);
    await page.waitForSelector('#pools .gt-table');
    await checkCountInFavourite(page, 'pools');
    await checkWidgetContains(page, 'pools', '<Root> [default]');
});
