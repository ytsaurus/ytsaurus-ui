import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterTille, makeClusterUrl} from '../utils';

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
    await page.click('.yc-modal .offset-selector button[data-qa="modal-confirm"]');

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

    await page.click('.column-selector__list-item:nth-child(2) .column-selector__list-item-check');
    await page.click("text='Apply'");

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'dynamic-table'}));
    await expect(page).toHaveURL(makeClusterUrl(`navigation?offsetMode=key&path=${PATH}`));

    const emptyColHeader2 = await page.$('.data-table__table-wrapper th:nth-child(3)');
    expect(emptyColHeader2).toBeNull();
});
