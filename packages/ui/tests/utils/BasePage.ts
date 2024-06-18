import {Page} from '@playwright/test';
import {replaceInnerHtml} from './dom';
import {E2E_DIR_NAME} from '.';

class DFDialogComponent {
    readonly page;

    constructor(page: Page) {
        this.page = page;
    }

    async showTab(name: string) {
        await this.page.click(`.df-dialog-tab__name :text("${name}")`);
        await this.page.mouse.move(0, 0);
    }

    async waitForField(title: string) {
        await this.page.waitForSelector(`.df-dialog__label :text("${title}")`);
    }
}

export class BasePage {
    readonly page: Page;
    readonly dfDialog: DFDialogComponent;

    constructor({page}: {page: Page}) {
        this.page = page;
        this.dfDialog = new DFDialogComponent(page);
    }

    async waitForTable(selector: string, rowCount: number) {
        await this.page.waitForSelector(`${selector} tbody tr:nth-child(${rowCount})`);
    }

    async replaceBreadcrumbsByTitle(title: string, replacement: string) {
        await replaceInnerHtml(this.page, {
            [`[title="${title}"] .unipika .string`]: `${replacement}`,
        });
    }

    async replaceBreadcrumbsTestDir() {
        await this.replaceBreadcrumbsByTitle(E2E_DIR_NAME, 'e2e.1970-01-01.00:00:00.xxxxxxxxxxx');
    }

    async waitForACL() {
        await this.page.waitForSelector('.navigation-acl__row .yt-subject-link');
    }
}
