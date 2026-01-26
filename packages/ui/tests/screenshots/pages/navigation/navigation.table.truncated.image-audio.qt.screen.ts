import {expect, test} from '@playwright/test';
import {E2E_DIR, MOCK_DATE, makeClusterUrl} from '../../../utils';
import {table} from '../../../widgets/TablePage';
import {queryPage} from '../../../widgets/QueryPage';
import {monaco} from '../../../widgets/Monaco';

test('Query/Result: truncated image-audio', async ({page}) => {
    test.slow();
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`navigation?path=${E2E_DIR}/tmp/table.truncated.image-audio`), {
        waitUntil: 'networkidle',
    });

    await page.setViewportSize({
        width: 1280,
        height: 1280,
    });

    await table(page).waitForTableContent('.navigation-table', 1);
    await table(page).replaceTableMeta();

    await table(page).openQueriesWidget();

    await queryPage(page).run();
    await queryPage(page).getResultTBodyLocator().waitFor({state: 'visible'});

    await monaco(page).replace({regex: E2E_DIR!, replacement: `e2e.tmp.dir`});
    await queryPage(page).replaceResultMeta();

    await expect(page).toHaveScreenshot();

    const imageLoc = await queryPage(page).showCellPreview(1, 2);
    const audioLoc = await queryPage(page).showCellPreview(1, 3);

    await imageLoc.locator('img').waitFor({state: 'visible'});
    await audioLoc.locator('audio').waitFor({state: 'visible'});

    await page.$eval('.query-result-table', (element) => {
        element.scrollTop = 0;
        element.scrollLeft = 0;
    });

    await expect(page).toHaveScreenshot();
});
