import {Page} from '@playwright/test';

let counter = -1;

export async function waitForClipboardText(page: Page) {
    const key = `__##__clipboard_value_${++counter}`;

    const res = await page.waitForFunction((key) => {
        const storage = window as unknown as Record<string, string>;

        console.log({k: key, v: storage[key]});

        if (storage[key]) {
            return storage[key];
        }

        async function fileClipboard() {
            if (storage[key]) {
                return;
            } else {
                storage[key] = await navigator.clipboard.readText();
            }
        }

        requestIdleCallback(() => fileClipboard());
    }, key);

    return await res.jsonValue();
}
