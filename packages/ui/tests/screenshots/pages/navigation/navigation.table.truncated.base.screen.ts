import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {TablePage} from './TablePage';
import {replaceInnerHtml} from '../../../utils/dom';

test('Navigation: truncated table - Content', async ({page}) => {
    const tablePage = new TablePage({page});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/truncated-table`), {
        waitUntil: 'networkidle',
    });

    await tablePage.waitForTablContent('.navigation-table', 1);
    await tablePage.replaceStaticTableMeta();

    await tablePage.resizePageForScreenshot();

    await expect(page).toHaveScreenshot();

    await test.step('Cell Preview Modal', async () => {
        const columns = await page
            .locator(
                '.data-table__table-wrapper tr:nth-child(1) td:nth-child(n+2) .data-table__value',
            )
            .all();

        for (const column of columns) {
            await tablePage.openCellPreviewDialog(column);

            await page.getByTestId('cell-preview-modal-content').isVisible();

            await replaceInnerHtml(page, {
                '[data-qa="cell-preview-command"]': 'yt read-table /path/to/table',
            });

            await expect(page).toHaveScreenshot();

            await page.getByTestId('simple-modal-close').click();
        }
    });
});
