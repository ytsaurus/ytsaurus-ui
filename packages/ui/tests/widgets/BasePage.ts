import {Page, expect} from '@playwright/test';
import {E2E_DIR_NAME} from '../utils';
import {replaceInnerHtml} from '../utils/dom';

export class HasPage {
    readonly page;
    constructor(page: Page) {
        this.page = page;
    }
}

class DFDialogComponent extends HasPage {
    private isLazyLoaded = false;

    async showTab(name: string) {
        this.waitForLazyLoad();

        await this.page.click(`.df-dialog-tab__name :text("${name}")`);
        await this.page.mouse.move(0, 0);
    }

    async waitForField(title: string) {
        this.waitForLazyLoad();

        await this.page.waitForSelector(`.df-dialog__label :text("${title}")`);
    }

    private async waitForLazyLoad() {
        if (this.isLazyLoaded) {
            return;
        }
        await this.page.waitForSelector('.df-dialog');
        await this.page.waitForLoadState('networkidle');
        this.isLazyLoaded = true;
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
        await this.page.evaluate(
            (data) => {
                const elements =
                    document.querySelectorAll<HTMLSpanElement>('.g-breadcrumbs .string');
                const element = Array.from(elements).find((i) => i.innerText === data.title);
                if (element) {
                    element.innerText = data.replacement;
                }
            },
            {title, replacement},
        );
    }

    async replaceBreadcrumbsTestDir() {
        await this.page.waitForSelector('.g-breadcrumbs');
        await this.replaceBreadcrumbsByTitle(E2E_DIR_NAME, 'e2e.1970-01-01.00:00:00.xxxxxxxxxxx');
    }

    async replaceBreadrumbsLastItem() {
        await replaceInnerHtml(this.page, {
            '.g-breadcrumbs .g-breadcrumbs__item:last-child a': 'localhost:XXXXX',
        });
    }

    async replaceACLInputPath() {
        await this.page.locator('.g-dialog').waitFor({state: 'visible'});
        const pathInput = this.page.locator(`input#path[value="//tmp/${E2E_DIR_NAME}"]`);
        await pathInput.waitFor({state: 'visible'});
        await pathInput.fill('e2e.1970-01-01.00:00:00.xxxxxxxxxxx', {force: true});
        await pathInput.evaluate((el: HTMLInputElement, value: string) => {
            if (el) {
                el.value = value;
                el.dispatchEvent(new Event('input', {bubbles: true}));
                el.dispatchEvent(new Event('change', {bubbles: true}));
            }
        }, 'e2e.1970-01-01.00:00:00.xxxxxxxxxxx');
    }

    async waitForACL() {
        await this.page.waitForSelector('.navigation-acl__row .yt-subject-link');
    }

    async resizePageForScreenshot() {
        const dimensions = await this.page.evaluate(() => {
            return {
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight,
            };
        });

        await this.page.setViewportSize({
            width: dimensions.width,
            height: dimensions.height,
        });
    }

    async settingsShowByName(name: string) {
        await this.page.fill(`.settings-panel [placeholder="Search settings"]`, name);
    }

    async settingsToggleVisibility({waitUntilClosed}: {waitUntilClosed?: boolean} = {}) {
        await this.page.waitForFunction(() => {
            const el = document.querySelector<HTMLElement>(
                '.gn-aside-header__footer [title="Settings"]',
            );
            el?.click();
            return Boolean(el);
        });
        if (waitUntilClosed) {
            await this.page.waitForFunction(() => {
                return !document.querySelector('.settings-panel');
            });
        }
    }

    async settingsShowSection(sectionName: string) {
        await this.page.click(`.settings-panel [data-id="/${sectionName}"]`);
    }

    async setCheckboxValue(testId: string, value: boolean) {
        const cbx = await this.page.getByTestId(testId);
        const checked = await cbx.isChecked();
        if (checked !== value) {
            await cbx.click();
        }
    }

    async waitForHidden(selector: string) {
        const loc = await this.page.locator(selector);
        while (loc.isHidden) {
            try {
                if (await loc.isHidden()) {
                    break;
                }
            } catch {}
        }
    }

    async scrollIntoVeiwIfNeededPassingByToolbar(
        selector: string,
        toolbarSelector = '.with-sticky-toolbar__toolbar',
    ) {
        /**
         * It is required to call callback from IntersectionObserver of StickyContainer,
         * without it toolbar will be never sticky on screenshots.
         */
        await this.page.locator(toolbarSelector).scrollIntoViewIfNeeded();
        await this.page.mouse.wheel(0, -200);

        await this.page.locator(selector).scrollIntoViewIfNeeded({timeout: 1000});
    }
}

export function basePage(page: Page) {
    return new BasePage({page});
}
