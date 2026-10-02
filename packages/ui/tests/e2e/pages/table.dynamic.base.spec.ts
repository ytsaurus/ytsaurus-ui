import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterTille, makeClusterUrl} from '../../utils';
import {basePage} from '../../widgets/BasePage';

const PATH = `${E2E_DIR}/dynamic-table`;

test('Dynamic table: should display first row', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector(
        '.data-table__table-wrapper tr:nth-child(1) td:nth-child(1) :text("key0")',
    );

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'dynamic-table'}));
    await expect(page).toHaveURL(makeClusterUrl(`navigation?offsetMode=key&path=${PATH}`));
});

test('Dynamic table: offset should work properly', async ({page}) => {
    const url = makeClusterUrl(`navigation?offsetValue=("key42")&offsetMode=key&path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector(
        ".data-table__table-wrapper tr:nth-child(1) td:nth-child(1) :text('key42')",
    );

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'dynamic-table'}));
    await expect(page).toHaveURL(url);

    const el = await page.$('.navigation-table-overview__query-current');
    await el?.click();

    await page.fill('.navigation-table-overview__input input', '("key98")');
    await page.keyboard.press('Enter');

    await page.waitForSelector(
        '.data-table__table-wrapper tr:nth-child(1) td:nth-child(1) :text("key98")',
    );
    await expect(page).toHaveURL(
        makeClusterUrl(`navigation?offsetValue=("key98")&offsetMode=key&path=${PATH}`),
    );
});

test('Dynamic table: offset dialog should work properly', async ({page}) => {
    const url = makeClusterUrl(`navigation?offsetValue=("key42")&offsetMode=key&path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector(
        ".data-table__table-wrapper tr:nth-child(1) td:nth-child(1) :text('key42')",
    );

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'dynamic-table'}));
    await expect(page).toHaveURL(url);

    const el = await page.getByTitle('Edit offset');
    await el?.click();
    await page.fill('.offset-selector__item input', '"key98"');
    await page.click('.g-modal .offset-selector button[data-qa="modal-confirm"]');

    await page.waitForSelector(
        '.data-table__table-wrapper tr:nth-child(1) td:nth-child(1) :text("key98")',
    );
    await expect(page).toHaveURL(
        makeClusterUrl(`navigation?offsetValue=("key98")&offsetMode=key&path=${PATH}`),
    );
});

test('Dynamic table: column selector work properly', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector('.data-table__table-wrapper th:nth-child(3) :text("empty")');

    await page.click('text="Columns"');

    await page.click('.column-selector__list-item-check[data-item="empty"]');
    await page.click("text='Apply'");

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'dynamic-table'}));
    await expect(page).toHaveURL(makeClusterUrl(`navigation?offsetMode=key&path=${PATH}`));

    const emptyColHeader2 = await page.$('.data-table__table-wrapper th:nth-child(3)');
    expect(emptyColHeader2).toBeNull();
});

test('Dynamic table: timestamp keys should preserve pagination offsets', async ({page}) => {
    test.setTimeout(30000);

    await basePage(page).override_window__DATA__(
        {},
        {
            'global::development::yqlTypes': true,
            'global::navigation::rowsPerTablePage': 10,
        },
    );
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/dynamic-timestamp-table`));

    const table = page.locator('.navigation-table .data-table__table-wrapper');
    const values = table.locator('tbody tr .yql_int64');
    const nextPage = page.getByTitle('Next page', {exact: true});

    const expectRows = async (start: number) => {
        await expect(values).toHaveText(Array.from({length: 10}, (_, i) => String(start + i)));
        // Query serialization must not change timestamp cells into Uint64 cells.
        await expect(table.locator('tbody tr .yql_timestamp')).toHaveCount(10);
    };
    const expectOffset = async (offset: string) => {
        await expect(page).toHaveURL((url) => url.searchParams.get('offsetValue') === offset);
    };

    await test.step('First page', async () => {
        await expectRows(0);
    });

    await test.step('Second page preserves microseconds in the offset', async () => {
        await nextPage.click();
        await expectRows(10);
        await expectOffset('(1704067200123466u)');
    });
    const secondPageUrl = page.url();

    await test.step('Third page has no skipped or repeated rows', async () => {
        await nextPage.click();
        await expectRows(20);
        await expectOffset('(1704067200123476u)');
        await expect(nextPage).toBeDisabled();
    });

    // Backward pagination is disabled for dynamic tables; reopen the saved offset.
    await test.step('Opening and reloading the saved second page', async () => {
        await page.goto(secondPageUrl);
        await expectRows(10);
        await page.reload();
        await expectRows(10);
        await expectOffset('(1704067200123466u)');
    });
});
