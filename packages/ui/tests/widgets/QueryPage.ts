import {Page} from '@playwright/test';
import {HasPage} from './BasePage';
import {FAKE_DATE, replaceInnerHtml} from '../utils/dom';

class QueryPage extends HasPage {
    async run() {
        await this.page.getByTestId('qt-run').click();
    }

    getResultTBodyLocator() {
        return this.page.locator('.yql-result-table tbody');
    }

    async showCellPreview(row: number, column: number) {
        const cellLoc = await this.getResultTBodyLocator().locator(
            `tr:nth(${row}) td:nth(${column})`,
        );

        await cellLoc.getByTestId('query:reqult:show-preview').click();

        return cellLoc;
    }

    async replaceResultMeta() {
        await replaceInnerHtml(this.page, {
            '.query-results .query-meta-info__duration .g-label__content': 'XX:XX:XX',
            '.query-results .query-meta-info__start-time': FAKE_DATE,
        });
    }
}

export function queryPage(page: Page) {
    return new QueryPage(page);
}
