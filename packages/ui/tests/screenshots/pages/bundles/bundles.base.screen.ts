import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';
import {replaceInnerHtml} from '../../../utils/dom';

const ID_PLACEHOLDER = 'X-XXX-XXXXX-XXXXXXXX';

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

    async replaceTabletCells() {
        await replaceInnerHtml(this.page, {
            '.cells-table__id-id': '1-XXXX-XXXXX-XXXXXXXXX',
            '.cells-table__td_col_tablets .cells-table__wrapped': '7',
            '.cells-table__td_col_memory .cells-table__wrapped': '0 B',
            '.cells-table__td_col_uncompressed .cells-table__wrapped': '000 KiB',
            '.cells-table__td_col_compressed .cells-table__wrapped': '000 KiB',
            '.cells-table__td_col_peeraddress .g-link': 'local:00',
        });
        await this.waitForTableSyncedWidth('.data-table', {useResizeEvent: true});
    }

    async replaceAttributesTime() {
        await this.page.waitForSelector('pre.unipika span.string');
        await this.page.evaluate((placeholder) => {
            const title = document.querySelector<HTMLDivElement>('.elements-modal__header span');
            if (!title) return;

            const id = title.textContent?.trim();
            if (!id) return;

            title.innerHTML = placeholder;

            const spans = document.querySelectorAll<HTMLSpanElement>('pre.unipika span.string');
            const isoTimeRegex = new RegExp(/^"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z"$/);
            const hostRegex = new RegExp(/^"localhost:\d+"$/);
            spans.forEach((span) => {
                const text = span.textContent?.trim();
                if (!text) return;
                if (text.match(isoTimeRegex)) {
                    span.innerHTML = '"1970-01-01T00:00:00.000Z"';
                }
                if (text.match(hostRegex)) {
                    span.innerHTML = '"localhost:00"';
                }
                if (text === `"${id}"`) {
                    span.innerHTML = placeholder;
                }
            });
        }, ID_PLACEHOLDER);
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

test('Bundles - List - Tablet cells', async ({page}) => {
    await page.goto(
        makeClusterUrl(`tablet_cell_bundles/tablet_cells?sortBy=column-bundle,order-undefined-asc`),
    );
    await page.waitForSelector('.cells-table');
    await bundles(page).replaceTabletCells();

    await expect(page).toHaveScreenshot();

    await page.click('input[placeholder="Enter bundle name..."]');
    await page.waitForSelector('.g-popup_open');
    await page.click('.suggest__item[title="default"]');
    await page.mouse.move(0, 0);

    await expect(page).toHaveScreenshot();

    await page.click('.cells-table__actions button');
    await page.waitForSelector('pre.unipika');
    await bundles(page).replaceAttributesTime();

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
