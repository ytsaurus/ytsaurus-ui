import {Locator, Page, expect} from '@playwright/test';
import {BasePage} from '../utils/BasePage';

export class LoginForm extends BasePage {
    private submitButton: Locator = this.page.getByText('Login');
    private loginField: Locator = this.page.getByPlaceholder('Login');
    private passwordField: Locator = this.page.getByPlaceholder('Password');

    constructor(page: Page) {
        super({page});
    }

    async verifyFormIsDisplayed() {
        await expect(this.page.getByTestId('login-form')).toBeVisible();
    }

    async fillForm({password, login}: {password: string; login: string}) {
        await this.loginField.fill(login);
        await this.passwordField.fill(password);
    }

    async submitForm() {
        await this.submitButton.click();
    }
}
