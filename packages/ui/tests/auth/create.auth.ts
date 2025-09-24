import {Page, test} from '@playwright/test';
import {LOGIN, PASSWORD, makeClusterUrl} from '../utils';
import {AUTH_FILE} from '../contants';

test('Create auth file', async ({page}) => {
    const url = makeClusterUrl();
    await page.goto(url);

    if (!LOGIN || !PASSWORD) {
        throw new Error(`Missing LOGIN or PASSWORD envs`);
    }

    await authPasswd({page, login: LOGIN, password: PASSWORD});
    await page.locator('.cluster-page-header').waitFor({state: 'visible'});

    await page.context().storageState({path: AUTH_FILE});
});

async function authPasswd({page, login, password}: {page: Page; login: string; password: string}) {
    await page.getByTestId('login-form:user').locator('input').fill(login);
    await page.getByTestId('login-form:password').locator('input').fill(password);
    await page.getByTestId('login-form:submit').click();
}
