import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';
import {BasePage} from '../../utils/BasePage';

class QueryTrackerPage extends BasePage {
    readonly newQueryButton = this.page.getByTestId('new-query-btn');
    readonly runQueryButton = this.page.getByTestId('qt-run');
    readonly queryEditor = this.page.locator('.monaco-editor').nth(0);

    async fillQueryEditor(lines: string[]) {
        await this.queryEditor.click();
        await this.page.keyboard.press('Meta+KeyA');

        for (const line of lines) {
            await this.page.keyboard.type(line);
        }
    }

    async isQueryEditorEmpty() {
        await expect(this.page.locator('.view-line')).toHaveCount(1);
    }

    async isQueryEditorNotEmpty() {
        await expect(this.page.locator('.view-line')).toHaveCount(1);
    }

    async clickOnNewQueryButton() {
        await this.newQueryButton.click();
    }

    async confirmClickOnNewQueryButton() {
        await this.page.getByTestId('modal-confirm').click();
    }

    async selectFirstQueryInHistory() {
        await this.page.locator('.query-history-item').nth(0).click();
    }

    async verifyQueryResultTable() {
        await expect(this.page.locator('.query-result-table')).toBeVisible();
    }

    async isQueryResultTableHide() {
        await expect(this.page.locator('.query-result-table')).toBeHidden();
    }

    async clickOnRunQuery() {
        await this.runQueryButton.click();
    }

    async getQueryText() {
        return this.page.locator('.view-lines.monaco-mouse-cursor-text').innerText();
    }
}

test('@QueryTracker: Click on a new query button should clear query', async ({page}) => {
    await page.goto(makeClusterUrl('queries'));

    const queryTrackerPage = new QueryTrackerPage({page});

    await queryTrackerPage.fillQueryEditor(['SELECT * FROM "//tmp/static-table"\n', 'LIMIT 20;\n']);
    await queryTrackerPage.clickOnNewQueryButton();
    await queryTrackerPage.confirmClickOnNewQueryButton();
    await queryTrackerPage.isQueryEditorEmpty();
});

test('@QueryTracker: Click on a new query button should reset current query', async ({page}) => {
    await page.goto(makeClusterUrl('queries'));

    const queryTrackerPage = new QueryTrackerPage({page});
    await queryTrackerPage.fillQueryEditor(['SELECT * FROM "//tmp/static-table"\n', 'LIMIT 20;\n']);
    await queryTrackerPage.clickOnRunQuery();
    await queryTrackerPage.clickOnNewQueryButton();
    await queryTrackerPage.confirmClickOnNewQueryButton();
    await queryTrackerPage.isQueryResultTableHide();
    await expect(page).toHaveURL(new RegExp(/\/queries\/?$/gm));
});

test('@QueryTracker: Click on the new query button in the queries widget should reset to the current query', async ({
    page,
}) => {
    await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/static-table`));

    await page.getByTitle('Open Queries widget').click();

    const queryTrackerPage = new QueryTrackerPage({page});

    const queryText = await queryTrackerPage.getQueryText();

    await queryTrackerPage.fillQueryEditor(['SELECT * FROM "//tmp/test-table"\n']);
    await queryTrackerPage.clickOnNewQueryButton();
    await queryTrackerPage.confirmClickOnNewQueryButton();

    await page.waitForSelector(`.view-line :text("static-table")`);

    const resetQueryText = await queryTrackerPage.getQueryText();

    await expect(resetQueryText).toBe(queryText);
});
