import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterTille, makeClusterUrl} from '../utils';

const PATH = `${E2E_DIR}/static-table`;

test('Static table: should display first row', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector(
        '.data-table__table-wrapper tr:nth-child(1) td:nth-child(2) :text("key0")',
    );

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'static-table'}));
    await expect(page).toHaveURL(url);
});

test('Static table: offset should work properly', async ({page}) => {
    const url = makeClusterUrl(`navigation?offsetValue=200&path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector(
        ".data-table__table-wrapper tr:nth-child(1) td:nth-child(2) :text('key200')",
    );

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'static-table'}));
    await expect(page).toHaveURL(url);

    const el = await page.$('.navigation-table-overview__query-current');
    await el?.click();

    await page.fill('.navigation-table-overview__input input', '298');
    await page.keyboard.press('Enter');

    await page.waitForSelector(
        '.data-table__table-wrapper tr:nth-child(1) td:nth-child(2) :text("key298")',
    );
    await expect(page).toHaveURL(makeClusterUrl(`navigation?offsetValue=298&path=${PATH}`));
});

test('Static table: column selector work properly', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    const emptyColHeader = await page.$(
        '.data-table__table-wrapper th:nth-child(4) :text("empty")',
    );
    console.log(await emptyColHeader?.textContent());

    await page.click('text="Columns"');

    await page.click('.column-selector__list-item:nth-child(3) .column-selector__list-item-check');
    await page.click("text='Apply'");

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'static-table'}));
    await expect(page).toHaveURL(url);

    const emptyColHeader2 = await page.$('.data-table__table-wrapper th:nth-child(4)');
    expect(emptyColHeader2).toBeNull();
});

test('Static table: externalProxy', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    await page.waitForSelector('.navigation');
    await page.waitForFunction(() => {
        window.__DATA__.uiSettings.directDownload = true;
        return window.__DATA__.uiSettings;
    });

    await page.click('button[data-qa="show-download-static-table"]');

    await page.waitForSelector(
        `a[href^="//external.proxy.my/api/v3/read_table?path=${encodeURIComponent(PATH)}"]`,
    );
});
