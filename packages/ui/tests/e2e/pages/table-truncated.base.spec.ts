import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';
import {BasePage} from '../../widgets/BasePage';

const PATH = `${E2E_DIR}/truncated-table`;

test('Static truncated table: should display preview icon instead of copy', async ({page}) => {
    const url = makeClusterUrl(`navigation?path=${PATH}`);
    await page.goto(url);

    const basePage = new BasePage({page});

    await basePage.waitForTable('.navigation-table', 1);
    await page.waitForSelector(':text("Data weight")');
    await basePage.waitForTableSyncedWidth('.navigation-table');

    const headers = page.locator('.data-table__table_sticky tr:nth-child(1) th:nth-child(n+2)');

    await expect(headers).toHaveText(['"string"', '"json"', '"yson"']);

    const columns = await page
        .locator('.data-table__table-wrapper tr:nth-child(1) td:nth-child(n+2) .data-table__value')
        .all();

    for (const column of columns) {
        await column.hover();

        const eyeIcon = column.getByTestId('truncated-preview-button');

        await expect(eyeIcon).toBeVisible();
    }
});
