import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';
import {BasePage} from '../../utils/BasePage';

function replaceNbsps(str: string) {
    var re = new RegExp(String.fromCharCode(160), "g");
    return str.replace(re, " ");
}

async function waitForAsyncCondition(cb: () => Promise<boolean>) {
    let attempts = 10;

    while (attempts--) {
        let result;
        try {
         result = await cb();
        } finally {
            if (result) {
                return;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

class QueryTrackerPage extends BasePage {
    readonly newQueryButton = this.page.getByTestId('new-query-btn');
    readonly runQueryButton = this.page.getByTestId('qt-run');
    readonly queryEditor = this.page.locator('.monaco-editor').nth(0);

    async fillQueryEditor(lines: string[]) {
        await this.queryEditor.click();
        await this.page.keyboard.press('Meta+KeyA');

        for (const line of lines) {
            await this.page.keyboard.type(line, { delay: 100 });
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
        const text = await this.page.locator('.view-lines.monaco-mouse-cursor-text').innerText();
        return replaceNbsps(text);
    }

    async clickToSuggest(suggest: string) {
        return this.page.locator(`[aria-label="${suggest}"]`).click();
    }

    async setCursor(position: number) {
        await this.queryEditor.click();

        // TODO: just an experiment
        for (let i = 0; i < 40; i++) {
            await this.page.keyboard.press("ArrowLeft");
        }

        for (let i = 0; i < position; i++) {
            await this.page.waitForTimeout(100);
            await this.page.keyboard.press("ArrowRight");
        }
    }

    async waitForText(text: string) {
        await waitForAsyncCondition(async () => {
            const queryText = await this.getQueryText()

            return queryText === text;
        });
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
    test.describe('Directory content suggest', () => {
        test(`After typing SELECT * FROM  we expect next suggest: \`//\``, async ({page}) => {
            const PARAMS = {
                userInput: 'SELECT * FROM ',
                expectedSuggest: '`//`',
                expectedResult: 'SELECT * FROM `//`',   
            };
    
            await page.goto(makeClusterUrl('queries'));
        
            const queryTrackerPage = new QueryTrackerPage({page});
    
            await queryTrackerPage.fillQueryEditor([PARAMS.userInput]);
        
            await queryTrackerPage.clickToSuggest(PARAMS.expectedSuggest);

            await queryTrackerPage.waitForText(PARAMS.expectedResult);
        });
    
        test(`After typing \`//\` we expect next suggest: //tmp`, async ({page}) => {
            const PARAMS = {
                initialInput: 'SELECT * FROM ``',
                initialCursorPosition: 15,

                userInput: '//',
                expectedSuggest: '//tmp',
                expectedResult: 'SELECT * FROM `//tmp`',
            };
            
            await page.goto(makeClusterUrl('queries'));
        
            const queryTrackerPage = new QueryTrackerPage({page});
    
            await queryTrackerPage.fillQueryEditor([PARAMS.initialInput]);
    
            await queryTrackerPage.waitForText(PARAMS.initialInput);
            
            await queryTrackerPage.setCursor(PARAMS.initialCursorPosition);
    
            await page.keyboard.type(PARAMS.userInput);
        
            await queryTrackerPage.clickToSuggest(PARAMS.expectedSuggest);
    
            await queryTrackerPage.waitForText(PARAMS.expectedResult);
        });
    
        test(`After typing \`//tm\` we expect next suggest: //tmp`, async ({page}) => {
            const PARAMS = {
                initialInput: 'SELECT * FROM ``',
                initialCursorPosition: 15,

                userInput: '//tm',
                expectedSuggest: '//tmp',
                expectedResult: 'SELECT * FROM `//tmp`',
                
            };
            
            await page.goto(makeClusterUrl('queries'));
        
            const queryTrackerPage = new QueryTrackerPage({page});
    
            await queryTrackerPage.fillQueryEditor([PARAMS.initialInput]);

            await queryTrackerPage.waitForText(PARAMS.initialInput);
    
            await queryTrackerPage.setCursor(PARAMS.initialCursorPosition);
    
            await page.keyboard.type(PARAMS.userInput);
        
            await queryTrackerPage.clickToSuggest(PARAMS.expectedSuggest);
    
            await queryTrackerPage.waitForText(PARAMS.expectedResult);
        });
    });
});
