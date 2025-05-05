import {Page} from '@playwright/test';

export async function setUserSettings(page: Page, path: string, value: any) {
    await page.waitForFunction(
        ({path, value}) => {
            (window as any).store.dispatch({
                type: 'SETTINGS:SET_SETTING_VALUE',
                data: {path, value},
            });
            return true;
        },
        {path, value},
    );
}
