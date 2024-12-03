import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';
import {replaceInnerHtml} from '../../../utils/dom';

class Bundles extends BasePage {
    async replaceDefaultColumns() {
        await replaceInnerHtml(this.page, {
            'tbody .bundles-table__td_col_nodes': '000',
            'tbody .bundles-table__td_col_tabletcells': '000',
            'tbody .bundles-table__td_col_tablets': '000',
            'tbody .bundles-table__td_col_memory': '000',
            'tbody .bundles-table__td_col_uncompressed': '000 KiB',
            'tbody .bundles-table__td_col_compressed': '000 KiB',
        });

        await this.waitForTableSyncedWidth('.bundles-table', {useResizeEvent: true});
    }

    async replaceTabletsColumns() {
        await replaceInnerHtml(this.page, {
            'tbody .bundles-table__td_col_tablet_count': '000',
        });
    }

    async replaceTabletsMemoryColumns() {
        await replaceInnerHtml(this.page, {
            'tbody .bundles-table__td_col_tablet_static_memory': '000 KiB',
        });
    }

    async replaceBundleCells() {
        await replaceInnerHtml(this.page, {
            '.cells-table__id-id': '0-11111-22222-33333333',
            '.yt-host .g-link': 'local:11',
        });

        await this.waitForTableSyncedWidth('.cells-table', {useResizeEvent: true});
    }
}

const bundles = (page: Page) => new Bundles({page});

test('Bundles - List - Default', async ({page}) => {
    await page.goto(makeClusterUrl(`tablet_cell_bundles?name=e2e-bundle`));

    await bundles(page).waitForTable('.bundles-table', 1, {text: 'e2e-bundle'});
    await bundles(page).replaceDefaultColumns();
    await expect(page).toHaveScreenshot();
});

test('Bundles - List - Tablets', async ({page}) => {
    await page.goto(makeClusterUrl(`tablet_cell_bundles?name=e2e-bundle&mode=tablets`));

    await bundles(page).waitForTable('.bundles-table', 1, {text: 'e2e-bundle'});
    await bundles(page).replaceTabletsColumns();
    await expect(page).toHaveScreenshot();
});

test('Bundles - List - Tablets memory', async ({page}) => {
    await page.goto(makeClusterUrl(`tablet_cell_bundles?name=e2e-bundle&mode=tablets_memory`));

    await bundles(page).waitForTable('.bundles-table', 1, {text: 'e2e-bundle'});
    await bundles(page).replaceTabletsMemoryColumns();
    await expect(page).toHaveScreenshot();
});

test('Bundles - Active bundle', async ({page}) => {
    await page.goto(makeClusterUrl(`tablet_cell_bundles/tablet_cells?activeBundle=e2e-bundle`));

    await bundles(page).replaceBundleCells();
    await expect(page).toHaveScreenshot();

    await test.step('Editor', async () => {
        await page.click(':text("Edit bundle")');
        await bundles(page).dfDialog.waitForField('Changelog account');
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot();

        await bundles(page).dfDialog.showTab('Resources');
        await bundles(page).dfDialog.waitForField('Tablet count');
        await expect(page).toHaveScreenshot();
    });
});

test('Bundles - ACL', async ({page}) => {
    await page.goto(makeClusterUrl(`tablet_cell_bundles/acl?activeBundle=e2e-bundle`));
    await bundles(page).waitForACL();

    await expect(page).toHaveScreenshot();

    await page.click('.acl-request-permissions button');
    await page.waitForSelector('.g-dialog');
    await expect(page).toHaveScreenshot();
});
