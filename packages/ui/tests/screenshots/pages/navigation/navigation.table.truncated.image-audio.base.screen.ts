import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../../utils';
import {TablePage} from './TablePage';

test('Navigation/Table: truncated image,audio', async ({page}) => {
    const tablePage = new TablePage({page});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/tmp/table.truncated.image-audio`), {
        waitUntil: 'networkidle',
    });

    await tablePage.waitForTableContent('.navigation-table', 1);
    await tablePage.replaceTableMeta();

    await expect(page).toHaveScreenshot();

    await page.waitForSelector('.data-table__table-wrapper tbody td:nth-child(2)');

    const imageLoc = await page.locator('.data-table__table-wrapper tbody td:nth-child(2)');
    await imageLoc.getByTestId('truncated-preview-button').click({force: true});

    const audioLoc = await page.locator('.data-table__table-wrapper tbody td:nth-child(3)');
    await audioLoc.getByTestId('truncated-preview-button').click({force: true});

    await imageLoc.locator('img').waitFor({state: 'visible'});
    await audioLoc.locator('audio').waitFor({state: 'visible'});

    await expect(page).toHaveScreenshot();
});
