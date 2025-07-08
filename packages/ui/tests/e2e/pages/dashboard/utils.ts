import {Page, expect, test} from '@playwright/test';

import {setUserSettings} from '../../../utils/settings';
import {CLUSTER, E2E_DIR, E2E_SUFFIX, makeClusterUrl} from '../../../utils';

export async function setupDashboard(page: Page) {
    await page.goto(makeClusterUrl('dashboard'));
    await setUserSettings(page, 'global::newDashboardPage', true);
    await setUserSettings(page, `local::${CLUSTER}::accounts::favourites`, [
        {path: `e2e-overcommit-${E2E_SUFFIX}`},
        {path: `e2e-parent-${E2E_SUFFIX}`},
    ]);
    await setUserSettings(page, `local::${CLUSTER}::scheduling::favourites`, [
        {path: '<Root>[default]'},
    ]);
    await setUserSettings(page, `local::${CLUSTER}::favourites`, [{path: E2E_DIR}]);
}

export async function enableEditMode(page: Page) {
    return test.step('Enable edit mode', async () => {
        const editButton = await page.waitForSelector('button:has-text("Edit dashboard")');
        await editButton.click();
    });
}

export async function saveEdit(page: Page) {
    return test.step('Save editted', async () => {
        const saveButton = await page.waitForSelector('button:has-text("Save dashboard")');
        await saveButton.click();
    });
}

export async function cancelEdit(page: Page) {
    return test.step('Cancel editted', async () => {
        const saveButton = await page.waitForSelector('button:has-text("Cancel editting")');
        await saveButton.click();
    });
}

export async function submitSettings(page: Page) {
    return test.step(`Submit widget settings`, async () => {
        const submitButton = page.locator('.g-dialog button[type="submit"]');
        await submitButton.waitFor({state: 'visible'});
        await submitButton.click();
        await submitButton.waitFor({state: 'hidden'});
    });
}

export async function openSettings(page: Page, widgetId: string) {
    return test.step(`Open ${widgetId} settings`, async () => {
        const widgetSettingsButton = page.locator(
            `[data-qa="dashkit-grid-item"]:has(#${widgetId}) [data-qa="dashkit-overlay-control-settings"]`,
        );
        await widgetSettingsButton.click();
    });
}

export async function setCustomName(page: Page, name: string) {
    return test.step(`Set custom widget name`, async () => {
        await page.fill('input[name="name"]', name);
    });
}

export async function checkCustomName(page: Page, widgetId: string, name: string) {
    return test.step(`Check widget-${widgetId} header`, async () => {
        const widgetHeader = page.locator(`[data-qa="${widgetId}-header"]`);
        await expect(widgetHeader).toContainText(name);
    });
}

export async function openCreateWidgetDialog(page: Page, widgetType: string) {
    return test.step(`Open create ${widgetType} dialog`, async () => {
        const menuButton = page.locator(`[data-qa="add-widget-button"]`);
        await menuButton.click();
        const capitalized =
            String(widgetType).charAt(0).toUpperCase() + String(widgetType).slice(1);
        const itemButton = page.locator(`.g-menu__item-content:has-text("${capitalized}")`);
        await itemButton.click();
        await page.waitForSelector(`span:has-text("${capitalized} widget settings")`);
    });
}

type CheckItemsOptions = {min?: number; equal?: number};

export async function checkTableItemsInWidget(
    page: Page,
    widgetId: string,
    ops?: CheckItemsOptions,
) {
    return test.step('Check items count is equal to header count', async () => {
        await page.waitForSelector(`#${widgetId} .gt-table__row`);
        const accounts = page.locator(`#${widgetId} .gt-table__body tr`);
        const lines = await accounts.count();
        const items = await page.locator(`[data-qa="${widgetId}-items-count"]`).innerText();
        if (ops?.equal !== undefined) {
            expect(lines).toBe(ops.equal);
        }
        if (ops?.min !== undefined) {
            expect(lines).toBeGreaterThan(ops.min);
        }
        expect(lines).toBe(Number(items));
    });
}

export async function checkWidgetContains(page: Page, widgetId: string, stroke: string) {
    return test.step(`Check widget ${widgetId} contains ${stroke}`, async () => {
        await page.waitForSelector(`#${widgetId}:has-text("${stroke}")`);
    });
}

export async function checkCountInCustom(page: Page, widgetId: string, ops?: CheckItemsOptions) {
    return test.step('Check lines in custom mode', async () => {
        const widgetCustom = page.locator(`#${widgetId} input[value="custom"]`);
        await widgetCustom.click();
        await checkTableItemsInWidget(page, `${widgetId}`, ops);
    });
}

export async function checkCountInFavourite(page: Page, widgetId: string, ops?: CheckItemsOptions) {
    return test.step('Check lines in favourite mode', async () => {
        const widgetFavourite = page.locator(`#${widgetId} input[value="favourite"]`);
        await widgetFavourite.click();
        await checkTableItemsInWidget(page, `${widgetId}`, ops);
    });
}
