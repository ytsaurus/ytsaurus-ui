import {test} from '@playwright/test';
import {
    enableEditMode,
    openCreateWidgetDialog,
    saveEdit,
    setCustomName,
    setupDashboard,
    submitSettings,
} from './utils';

test('Dashboard - Queries widget authors', async ({page}) => {
    await setupDashboard(page);

    await enableEditMode(page);
    await openCreateWidgetDialog(page, 'queries');

    await setCustomName(page, 'Queries with custom user');

    await test.step('Setup authors', async () => {
        const authorSelectButton = page.locator('button:has-text("Enter user name or login...")');
        await authorSelectButton.click();
        await page.waitForSelector('.g-select-popup');
        const authorInput = page.locator('.g-popup input');
        await authorInput.fill('guest');
        const guestUserOption = page.locator('.g-select-list__option:has-text("guest")');
        await guestUserOption.click();
    });
    await submitSettings(page);
    await saveEdit(page);

    await page
        .locator(
            '[data-qa="dashkit-grid-item"]:has-text("Queries with custom user"):has-text("No queries found")',
        )
        .scrollIntoViewIfNeeded();
});

test('Dashboard - Create queries widget with limit', async ({page}) => {
    await setupDashboard(page);

    await enableEditMode(page);
    await openCreateWidgetDialog(page, 'queries');

    await setCustomName(page, 'Queries with limit');

    await test.step('Setup authors', async () => {
        const authorSelectButton = page.locator('button:has-text("Enter user name or login...")');
        await authorSelectButton.click();
        await page.waitForSelector('.g-select-popup');
        const authorInput = page.locator('.g-popup input');
        await authorInput.fill('root');
        const rootUserOption = page.locator('.g-select-list__option:has-text("root")');
        await rootUserOption.click();
    });

    await test.step('Setup limit', async () => {
        await page.locator('[name="limit"]').fill('0');
    });
    await submitSettings(page);
    await saveEdit(page);

    await page
        .locator(
            '[data-qa="dashkit-grid-item"]:has-text("Queries with limit"):has-text("No queries found")',
        )
        .scrollIntoViewIfNeeded();
});
