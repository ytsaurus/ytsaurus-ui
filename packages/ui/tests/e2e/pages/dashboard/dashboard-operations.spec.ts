import {test} from '@playwright/test';
import {
    checkCountInCustom,
    checkTableItemsInWidget,
    checkWidgetContains,
    enableEditMode,
    openSettings,
    saveEdit,
    setupDashboard,
    submitSettings,
} from './utils';

test('Dashboard - Operations widget default', async ({page}) => {
    await setupDashboard(page);

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    await page.waitForSelector('#operations .gt-table__row');

    await checkTableItemsInWidget(page, 'operations');
});

test('Dashboard - Operations widget limit', async ({page}) => {
    await setupDashboard(page);

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    await page.waitForSelector('#operations .gt-table__row');

    await enableEditMode(page);
    await openSettings(page, 'operations');

    const inputLimit = page.locator('[name="limit"]');
    await inputLimit.fill('1');

    await submitSettings(page);
    await saveEdit(page);

    await checkCountInCustom(page, 'operations', {equal: 1});
});

test('Dashboard - Operations widget authors', async ({page}) => {
    await setupDashboard(page);

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    await page.waitForSelector('#operations .gt-table__row');

    await enableEditMode(page);
    await openSettings(page, 'operations');

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

    await page.locator('[data-qa="operations-author-filter"] [value="custom"]').click();
    await page.locator('#operations:has-text("No operations found")').waitFor();
});

test('Dashboard - Operations widget pools', async ({page}) => {
    await setupDashboard(page);

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();
    await page.locator('[data-qa="operations-author-filter"] [value="me"]').click();

    await page.waitForSelector('#operations .gt-table__row');

    await enableEditMode(page);
    await openSettings(page, 'operations');

    const treeControl = page.locator('button:has-text("Select tree")');
    await treeControl.click();

    const e2eTreeOption = page.locator('.g-select-list__option:has-text("e2e")');
    await e2eTreeOption.click();

    const poolControl = page.locator('button:has-text("Select pool")');
    await poolControl.click();

    const e2ePoolOption = page.locator('.g-select-list__option:has-text("test-e2e")');
    await e2ePoolOption.click();

    await submitSettings(page);
    await saveEdit(page);

    await checkWidgetContains(page, 'operations', 'Tasks[Main2]');
});

test('Dashboard - Operations widget running', async ({page}) => {
    await setupDashboard(page);

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    await page.locator('[data-qa="operations-state-filter"]').click();

    const stateSelect = page.locator('#operations .g-select-control__button:has-text("State:")');
    await stateSelect.click();

    const runningOption = page.getByRole('option', {name: 'Running'});
    await runningOption.click();

    await checkTableItemsInWidget(page, 'operations', {equal: 1});
});
