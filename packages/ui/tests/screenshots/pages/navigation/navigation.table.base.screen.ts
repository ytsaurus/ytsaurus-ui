import {Page, expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {replaceInnerHtml} from '../../../utils/dom';
import {TablePage} from './TablePage';

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

    await page.click('.elements-modal__close');

    await test.step('Merge dialog', async () => {
        const tablePath = '//tmp/e2e.1970-01-01.00:00:00.xxxxxxxxxxx.static-table';
        await page.click('button.edit-table-actions__button');
        await page.waitForSelector('.g-popup__content');
        await page.click('.g-menu__list-item :text("Merge")');
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        await page.waitForSelector('.g-dialog');
        await replaceInnerHtml(page, {
            '.df-editable-list__item-content': tablePath,
        });
        await page.evaluate((tablePath) => {
            const input = document.querySelector<HTMLInputElement>(
                'input[placeholder="Enter path for output"]',
            );
            if (input) input.value = tablePath;
        }, tablePath);
        await page.click('.df-dialog__field-group_type_pool-tree button.g-select-control__button');

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

test('Navigation: static-table - rowselector', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/static-table`));

    await tablePage(page).replaceStaticTableMeta();
    await tablePage(page).waitForTablContent('.navigation-table', 10);

    await page.click('.navigation-table-overview__input', {force: true});
    await page.click('.rc-slider', {force: true, position: {x: 200, y: 0}});

    await page.waitForSelector(':text("key139")');

    await expect(page).toHaveScreenshot();
});
