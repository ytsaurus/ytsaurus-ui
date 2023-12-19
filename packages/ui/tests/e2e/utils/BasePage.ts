import {Page} from '@playwright/test';

export class BasePage {
    readonly page: Page;

    constructor({page}: {page: Page}) {
        this.page = page;
    }
}
