import {Page, expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {NavigationPage} from './NavigationPage';
import {replaceInnerHtml} from '../../../utils/dom';

class TablePage extends NavigationPage {
    async waitForTablContent(selector: string, rowCount: number) {
        await this.waitForTable(selector, rowCount);
        await this.page.waitForSelector(':text("Data weight")');
        await this.waitForTableSyncedWidth(selector);
    }

    async replaceStaticTableMeta() {
        await this.replaceBreadcrumbsTestDir();
        await replaceInnerHtml(this.page, {
            '[data-qa="expiration_timeout_path"]': 'e2e.1970-01-01.00:00:00.xxxxxxxxxxx',
            '.meta-table-item__time': '01 Jan 1970 00:00:00',
            '.meta-table-item__id': '0-11111-22222-33333333',
            '.meta-table-item__value_format_bytes': '00.00 KiB',
        });
    }
}

function tablePage(page: Page) {
    return new TablePage({page});
}

test('Navigation: table - Content', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/static-table`));

    await tablePage(page).waitForTablContent('.navigation-table', 10);
    await tablePage(page).replaceStaticTableMeta();

    await expect(page).toHaveScreenshot();

    await test.step('DownloadManager', async () => {
        await page.getByText('Download').click();
        await page.click('.table-download-manager__settings :text("Range")', {force: true});
        await page.waitForSelector('.table-download-manager__settings :text("Number of rows")');
        await page.click('.table-download-manager__settings :text("Custom")', {force: true});
        await page.waitForSelector('.table-download-manager__settings .column-selector');

        await expect(page).toHaveScreenshot();
    });
});

test('Navigation: table - Schema', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/dynamic-table&navmode=schema`));

    await tablePage(page).waitForTable('.navigation-schema', 3);
    await tablePage(page).replaceBreadcrumbsTestDir();
    page.getByTestId('');

    await expect(page).toHaveScreenshot();
});

test('Navigation: table - Tablets', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/dynamic-table&navmode=tablets`));

    await tablePage(page).waitForTable('.navigation-tablets', 2);
    await tablePage(page).replaceBreadcrumbsTestDir();
    page.getByTestId('');
    await replaceInnerHtml(page, {
        '.navigation-tablets__id-link .g-link': '0-11111-22222-33333333',
        '.yt-host .g-link:not(:empty)': 'local:XX',
    });

    await expect(page).toHaveScreenshot();
});
