import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {table} from '../../../widgets/TablePage';
import {replaceInnerHtml} from '../../../utils/dom';

test('Navigation: truncated table - Content', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/truncated-table`), {
        waitUntil: 'networkidle',
    });

    await table(page).waitForTableContent('.navigation-table', 1);
    await table(page).replaceTableMeta();

    await table(page).resizePageForScreenshot();

    await expect(page).toHaveScreenshot({maxDiffPixels: 5});

    await test.step('Cell Preview Modal', async () => {
        const columns = await page
            .locator('.data-table__table-wrapper tr:nth-child(1) td:nth-child(n+2) .yt-column-cell')
            .all();

        for (let i = 0; i < columns.length; ++i) {
            await table(page).showCellPreview(1, i + 2);

            await page.getByTestId('cell-preview-modal-content').isVisible();

            await replaceInnerHtml(page, {
                '[data-qa="cell-preview-command"]': 'yt read-table /path/to/table',
            });

            await expect(page).toHaveScreenshot({maxDiffPixels: 5});

            await page.getByTestId('simple-modal-close').click();
        }
    });
});
