import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {table} from '../../../widgets/TablePage';

test('Navigation/Table: truncated image-audio', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/tmp/table.truncated.image-audio`), {
        waitUntil: 'networkidle',
    });

    await table(page).waitForTableContent('.navigation-table', 1);
    await table(page).replaceTableMeta();

    await expect(page).toHaveScreenshot();

    const imageLoc = await table(page).showCellPreview(1, 2);
    const audioLoc = await table(page).showCellPreview(1, 3);

    await imageLoc.locator('img').waitFor({state: 'visible'});
    await audioLoc.locator('audio').waitFor({state: 'visible'});

    await expect(page).toHaveScreenshot();
});
