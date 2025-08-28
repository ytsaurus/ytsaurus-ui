import {expect, test} from '@playwright/test';
import {CLUSTER_TITLE, E2E_DIR, makeClusterUrl} from '../../utils';
import {BasePage} from '../../widgets/BasePage';

function replaceNbsps(str: string) {
    var re = new RegExp(String.fromCharCode(160), "g");
    return str.replace(re, " ");
}

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

    async type(userInput: string) {
        await this.page.keyboard.type(userInput);
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
        const text = await this.page.locator('.view-lines.monaco-mouse-cursor-text').innerText();
        return replaceNbsps(text);
    }

    async waitForSuggest(suggest: string) {
        await expect(this.page.locator(`[aria-label="${suggest}"]`)).toBeVisible();
    }

    async clickToSuggest(suggest: string) {
        return this.page.locator(`[aria-label="${suggest}"]`).click();
    }

    async setCursor(position: number) {
        await this.queryEditor.click();

        if (process.platform === 'darwin') {
            await this.page.keyboard.press("Meta+ArrowLeft");
        } else {
            await this.page.keyboard.press("Home");
        }

        for (let i = 0; i < position; i++) {
            await this.page.keyboard.press("ArrowRight");
        }
    }

    async waitForText(text: string) {
        const locator = this.page.locator('.view-lines.monaco-mouse-cursor-text');
        
        await expect(locator).toHaveText(text);
    }

    async selectCluster(cluster: string) {
        await this.page.getByTestId('query-cluster-selector').click();
        await this.page.getByTestId('query-cluster-item-name').getByText(cluster, {exact: true}).click();
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


test.describe('@QueryTracker: Suggest scenarios', () => {
    let queryTrackerPage: QueryTrackerPage;

    test.beforeEach(async ({page}) => {
        queryTrackerPage = new QueryTrackerPage({page});
        await queryTrackerPage.page.goto(makeClusterUrl('queries'));
        await queryTrackerPage.selectCluster(CLUSTER_TITLE!);
    });

    test.describe('Base suggest and cursor position', () => {
        test(`After typing SELECT * FROM  we expect next suggest: \`//\` with cursor should be right after \`//`, async () => {
            await queryTrackerPage.fillQueryEditor(['SELECT * FROM ']);

            await queryTrackerPage.clickToSuggest('`//`');

            await queryTrackerPage.waitForText('SELECT * FROM `//`');

            await queryTrackerPage.type('cursor_position');

            await queryTrackerPage.waitForText('SELECT * FROM `//cursor_position`');
        });

        test('Type "SELECT * FROM `", click to "//" suggest, type "cursor_position", expect to see "SELECT * FROM `//cursor_position`"', async () => {
            await queryTrackerPage.fillQueryEditor(['SELECT * FROM `']);

            await queryTrackerPage.waitForText('SELECT * FROM ``');

            await queryTrackerPage.clickToSuggest('//');

            await queryTrackerPage.type('cursor_position');

            await queryTrackerPage.waitForText('SELECT * FROM `//cursor_position`');
        });

        test(`After typing \` we expect to get \`\` with cursor after \``, async () => {
            await queryTrackerPage.fillQueryEditor(['SELECT * FROM `']);

            await queryTrackerPage.waitForText('SELECT * FROM ``');

            await queryTrackerPage.type('cursor_position');

            await queryTrackerPage.waitForText('SELECT * FROM `cursor_position`');
        });
    })

    test.describe('Directory content suggest', () => {    
        test(`After typing \`//\` we expect next suggest: tmp`, async () => {
            await queryTrackerPage.fillQueryEditor(['SELECT * FROM `']);

            await queryTrackerPage.waitForText('SELECT * FROM ``');

            await queryTrackerPage.type('//');

            await queryTrackerPage.clickToSuggest('tmp');

            await queryTrackerPage.waitForText('SELECT * FROM `//tmp`');
        });
    
        test(`After typing \`//tm\` we expect next suggest: tmp`, async () => {
            await queryTrackerPage.fillQueryEditor(['SELECT * FROM `']);

            await queryTrackerPage.waitForText('SELECT * FROM ``');

            await queryTrackerPage.type('//tm');

            await queryTrackerPage.clickToSuggest('tmp');

            await queryTrackerPage.waitForText('SELECT * FROM `//tmp`');
        });
    });

    test.describe('Table columns suggest', () => { 
        test(`When we make a select from table we can get columns suggest`, async () => {
            const query = `SELECT from \`${E2E_DIR}/static-table\``;

            await queryTrackerPage.fillQueryEditor([query]);

            await queryTrackerPage.setCursor('SELECT'.length);

            await queryTrackerPage.type(' ');

            await queryTrackerPage.waitForSuggest(`empty (\`${E2E_DIR}/static-table\`), Column`);

            await queryTrackerPage.waitForSuggest(`key (\`${E2E_DIR}/static-table\`), Column`);

            await queryTrackerPage.waitForSuggest(`value (\`${E2E_DIR}/static-table\`), Column`);
        });
    });
});
