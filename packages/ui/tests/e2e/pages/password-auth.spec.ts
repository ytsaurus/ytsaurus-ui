import {test, expect} from '@playwright/test';
import {USER_LOGIN, USER_PASSWORD, makeClusterUrl} from '../utils';
import {LoginForm} from '../pom/login-form';

test('@PasswordAuth: User should be logged in', async ({page}) => {
    await page.goto(makeClusterUrl());

    const loginForm = new LoginForm(page);

    await loginForm.verifyFormIsDisplayed();
    await loginForm.fillForm({
        login: USER_LOGIN!,
        password: USER_PASSWORD!,
    });
    await loginForm.submitForm();

    await expect(page.locator('.cluster-page-header')).toBeVisible();
});
