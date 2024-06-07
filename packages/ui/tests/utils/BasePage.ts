import {Page} from '@playwright/test';
import {replaceInnerHtml} from './dom';
import {E2E_DIR_NAME} from '.';

export class BasePage {
    readonly page: Page;

    constructor({page}: {page: Page}) {
        this.page = page;
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
}
