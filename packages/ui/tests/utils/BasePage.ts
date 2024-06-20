import {Page} from '@playwright/test';
import {replaceInnerHtml} from './dom';
import {E2E_DIR_NAME} from '.';

class HasPage {
    readonly page;
    constructor(page: Page) {
        this.page = page;
    }
}

class DFDialogComponent extends HasPage {
    async showTab(name: string) {
        await this.page.click(`.df-dialog-tab__name :text("${name}")`);
        await this.page.mouse.move(0, 0);
    }

    async waitForField(title: string) {
        await this.page.waitForSelector(`.df-dialog__label :text("${title}")`);
    }
}

class RadioButton extends HasPage {
    async selectByValue(selector: string, value: string) {
        await this.page.click(`${selector} input[value="${value}"]`, {force: true});
    }
}

export class BasePage extends HasPage {
    readonly radioBtn: RadioButton;
    readonly dfDialog: DFDialogComponent;

    constructor({page}: {page: Page}) {
        super(page);
        this.dfDialog = new DFDialogComponent(page);
        this.radioBtn = new RadioButton(page);
    }

    async waitForTable(selector: string, rowCount: number, {text}: {text?: string} = {}) {
        if (text) {
            await this.page.waitForSelector(`${selector} tbody tr :text("${text}")`);
        }

        await this.page.waitForSelector(`${selector} tbody tr:nth-child(${rowCount})`);
    }
    /**
     * Whait until widths of column headers and data columns are equal
     * @param selector
     */
    async waitForTableSyncedWidth(
        selector: string,
        {useResizeEvent}: {useResizeEvent?: boolean} = {},
    ) {
        await this.page.waitForFunction(
            ({selector, useResizeEvent}) => {
                const colHeaders = document.querySelector(`${selector} thead tr:nth-child(1)`);
                const firstRow = document.querySelector(`${selector} tbody tr:nth-child(1)`);
                const res = [];
                for (let i = 0; i < colHeaders?.children.length!; ++i) {
                    const headWidth = (colHeaders?.children[i] as HTMLElement)?.offsetWidth;
                    const dataWidth = (firstRow?.children[i] as HTMLElement)?.offsetWidth;
                    if (headWidth !== dataWidth) {
                        res.push(headWidth, dataWidth);
                    }
                }
                if (useResizeEvent && res.length) {
                    window.dispatchEvent(new Event('resize'));
                }
                return res.length === 0;
            },
            {selector, useResizeEvent},
        );
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
