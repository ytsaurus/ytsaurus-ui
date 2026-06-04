import {Page} from '@playwright/test';

export async function waitForStoreWithoutActions(page: Page, timeout = 500) {
    await page.waitForFunction((minTimeout) => {
        const diff = Date.now() - window.store.lastActionTime;
        return diff >= minTimeout;
    }, timeout);
}
