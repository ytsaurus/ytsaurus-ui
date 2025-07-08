import {test} from '@playwright/test';
import {
    checkCustomName,
    enableEditMode,
    openCreateWidgetDialog,
    openSettings,
    saveEdit,
    setCustomName,
    setupDashboard,
    submitSettings,
} from './utils';

test('Dashboard - Edit widgets names', async ({page}) => {
    await setupDashboard(page);

    const ids = ['navigation', 'accounts', 'pools', 'operations'];

    for (const id of ids) {
        await test.step(`Customize ${id} widget`, async () => {
            const customWidgetName = `Custom ${id} name`;
            const widgetId = id;

            await enableEditMode(page);
            await openSettings(page, widgetId);
            await setCustomName(page, customWidgetName);
            await submitSettings(page);
            await saveEdit(page);

            await checkCustomName(page, widgetId, customWidgetName);
        });
    }
});

test('Dashboard - Create widgets', async ({page}) => {
    await setupDashboard(page);

    await enableEditMode(page);
    const types = ['navigation', 'operations', 'accounts', 'pools'];
    for (const type of types) {
        await test.step(`Create ${type} widget`, async () => {
            const customWidgetName = `New ${type} widget`;
            await openCreateWidgetDialog(page, type);
            await setCustomName(page, customWidgetName);
            await submitSettings(page);
        });
    }

    await saveEdit(page);

    for (const type of types) {
        const newWidget = page.locator(
            `[data-qa="dashkit-grid-item"]:has-text("New ${type} widget")`,
        );
        await newWidget.scrollIntoViewIfNeeded();
        await newWidget.waitFor();
    }
});

test('Dashboard - Cancel editting', async ({page}) => {
    await setupDashboard(page);

    await enableEditMode(page);
    await openCreateWidgetDialog(page, 'navigation');
    await setCustomName(page, 'willberemoved');
    await submitSettings(page);

    const willBeRemovedTitle = page.locator(
        '[data-qa="dashkit-grid-item"]:has-text("willberemoved")',
    );
    await willBeRemovedTitle.scrollIntoViewIfNeeded();
    await willBeRemovedTitle.waitFor();

    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    await willBeRemovedTitle.waitFor({state: 'detached'});
});
