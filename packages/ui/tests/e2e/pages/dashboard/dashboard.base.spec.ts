import {expect, test} from '@playwright/test';
import {E2E_DIR, E2E_SUFFIX, makeClusterUrl} from '../../../utils';
import {
    checkCountInCustom,
    checkCountInFavourite,
    checkCustomName,
    checkTableItemsInWidget,
    checkWidgetContains,
    enableEditMode,
    openCreateWidgetDialog,
    openSettings,
    saveEdit,
    setCustomName,
    submitSettings,
} from './utils';

test('Dashboard - Edit accounts widget', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

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

test('Dashboard - Edit widgets names', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

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

test('Dashboard - Make custom list for pools', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

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
    await page.goto(makeClusterUrl('dashboard'));
    await page.waitForSelector('#pools .gt-table');
    await checkCountInFavourite(page, 'pools');
    await checkWidgetContains(page, 'pools', '<Root> [default]');
});

test('Dashboard - Check default favourite accounts', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));
    await page.waitForSelector('#accounts .gt-table');
    await checkCountInFavourite(page, 'accounts', {equal: 2});
    await checkWidgetContains(page, 'accounts', `e2e-overcommit-${E2E_SUFFIX}`);
    await checkWidgetContains(page, 'accounts', `e2e-parent-${E2E_SUFFIX}`);
});

test('Dashboard - Check favourite paths', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

    await page.waitForSelector('#navigation:has-text("No last visited paths found")');

    const widgetFavourite = page.locator(`#navigation input[value="favourite"]`);
    await widgetFavourite.click();

    const navigation = page.locator(`#navigation .yt-navigation-widget-content__navigation-item`);
    await navigation.waitFor({state: 'visible'});
    const lines = await navigation.count();
    const items = await page.locator(`[data-qa="navigation-items-count"]`).innerText();
    expect(lines).toBe(Number(items));

    await checkWidgetContains(page, 'navigation', E2E_DIR);
});

test('Dashboard - Operations widget default', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    await page.waitForSelector('#operations .gt-table__row');

    await checkTableItemsInWidget(page, 'operations');
});

test('Dashboard - Operations widget limit', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    await page.waitForSelector('#operations .gt-table__row');

    await enableEditMode(page);
    await openSettings(page, 'operations');

    const inputLimit = page.locator('[name="limit"]');
    await inputLimit.fill('3');

    await submitSettings(page);
    await saveEdit(page);

    await checkTableItemsInWidget(page, 'operations', {equal: 3});
});

test('Dashboard - Operations widget pools', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

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
    await page.goto(makeClusterUrl('dashboard'));

    const widget = page.locator('#operations');
    await widget.scrollIntoViewIfNeeded();

    const stateSelect = page.locator('#operations .g-select-control__button:has-text("State:")');
    await stateSelect.click();

    const runningOption = page.getByRole('option', {name: 'Running'});
    await runningOption.click();

    await checkTableItemsInWidget(page, 'operations', {equal: 1});
});

test('Dashboard - Create widgets', async ({page}) => {
    await page.goto(makeClusterUrl('dashboard'));

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
    await page.goto(makeClusterUrl('dashboard'));

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
