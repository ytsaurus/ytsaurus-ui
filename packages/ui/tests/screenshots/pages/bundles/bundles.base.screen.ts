import {Page, expect, test} from '@playwright/test';
import {MOCK_DATE, makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../widgets/BasePage';
import {replaceInnerHtml} from '../../../utils/dom';

const ID_PLACEHOLDER = 'X-XXX-XXXXX-XXXXXXXX';
const ATTRIBUTES_RESPONSE_MOCK = {
    id: {$type: 'string', $value: ID_PLACEHOLDER},
    builtin: {$type: 'boolean', $value: 'false'},
    sequoia: {$type: 'boolean', $value: 'false'},
    ref_counter: {$type: 'int64', $value: '1'},
    ephemeral_ref_counter: {$type: 'int64', $value: '0'},
    foreign: {$type: 'boolean', $value: 'false'},
    native_cell_tag: {$type: 'uint64', $value: '1'},
    revision: {$type: 'uint64', $value: '0'},
    attribute_revision: {$type: 'uint64', $value: '0'},
    content_revision: {$type: 'uint64', $value: '0'},
    effective_acl: null,
    user_attribute_keys: [],
    opaque_attribute_keys: null,
    user_attributes: null,
    life_stage: {$type: 'string', $value: 'creation_committed'},
    estimated_creation_time: null,
    leading_peer_id: {$type: 'int64', $value: '0'},
    health: null,
    local_health: null,
    peers: [
        {
            address: {$type: 'string', $value: 'localhost:00'},
            state: {$type: 'string', $value: 'leading'},
            last_seen_time: {$type: 'string', $value: '1970-01-01T00:00:00.000Z'},
            last_seen_state: {$type: 'string', $value: 'leading'},
        },
    ],
    config_version: {$type: 'int64', $value: '2'},
    prerequisite_transaction_id: {$type: 'string', $value: ID_PLACEHOLDER},
    cell_bundle_id: {$type: 'string', $value: ID_PLACEHOLDER},
    area: {$type: 'string', $value: 'default'},
    area_id: {$type: 'string', $value: ID_PLACEHOLDER},
    status: {
        health: {$type: 'string', $value: 'good'},
        decommissioned: {$type: 'boolean', $value: 'false'},
    },
    multicell_status: null,
    max_changelog_id: null,
    max_snapshot_id: null,
    suspended: {$type: 'boolean', $value: 'false'},
    lease_transaction_ids: null,
    registered_in_cypress: {$type: 'boolean', $value: 'true'},
    pending_acls_update: {$type: 'boolean', $value: 'false'},
    action_ids: null,
    multicell_statistics: null,
};

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
}

const bundles = (page: Page) => new Bundles({page});

test('Bundles - List - Default', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`tablet_cell_bundles?name=e2e-bundle`));

    await bundles(page).waitForTable('.bundles-table', 1, {text: 'e2e-bundle'});
    await bundles(page).replaceDefaultColumns();
    await expect(page).toHaveScreenshot();
});

test('Bundles - List - Tablets', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`tablet_cell_bundles?name=e2e-bundle&mode=tablets`));

    await bundles(page).waitForTable('.bundles-table', 1, {text: 'e2e-bundle'});
    await bundles(page).replaceTabletsColumns();
    await expect(page).toHaveScreenshot();
});

test('Bundles - List - Tablets memory', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`tablet_cell_bundles?name=e2e-bundle&mode=tablets_memory`));

    await bundles(page).waitForTable('.bundles-table', 1, {text: 'e2e-bundle'});
    await bundles(page).replaceTabletsMemoryColumns();
    await expect(page).toHaveScreenshot();
});

test('Bundles - List - Tablet cells', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(
        makeClusterUrl(`tablet_cell_bundles/tablet_cells?sortBy=column-bundle,order-undefined-asc`),
    );
    await page.waitForSelector('.cells-table');
    await bundles(page).replaceTabletCells();
    await bundles(page).waitForTableSyncedWidth('.cells-table');

    await expect(page).toHaveScreenshot();

    await page.click('input[placeholder="Enter bundle name..."]');
    await page.waitForSelector('.g-popup_open');
    await page.click('.suggest__item[title="default"]');
    await page.mouse.move(0, 0);

    await expect(page).toHaveScreenshot();

    await page.route('**/api/yt/ui/api/v3/get', (route) => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(ATTRIBUTES_RESPONSE_MOCK),
        });
    });
    await page.click('.cells-table__actions button');
    await page.mouse.move(0, 0);
    await page.waitForSelector('pre.unipika');

    await replaceInnerHtml(page, {
        '.elements-modal__header .elements-text': ID_PLACEHOLDER,
    });

    await expect(page).toHaveScreenshot();
});

test('Bundles - Active bundle', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`tablet_cell_bundles/tablet_cells?activeBundle=e2e-bundle`));
    await page.waitForLoadState('networkidle');

    await bundles(page).replaceBundleCells();
    await bundles(page).waitForTableSyncedWidth('.cells-table');
    await expect(page).toHaveScreenshot();

    await test.step('Editor', async () => {
        await page.click(':text("Edit bundle")');
        await page.waitForLoadState('networkidle');
        await bundles(page).dfDialog.waitForField('Changelog account');
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot();

        await bundles(page).dfDialog.showTab('Resources');
        await bundles(page).dfDialog.waitForField('Tablet count');
        await expect(page).toHaveScreenshot();
    });
});

test('Bundles - ACL', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeClusterUrl(`tablet_cell_bundles/acl?activeBundle=e2e-bundle`));
    await bundles(page).waitForACL();

    await expect(page).toHaveScreenshot();

    await page.click('.acl-request-permissions button');
    await page.waitForSelector('.g-dialog');
    await expect(page).toHaveScreenshot();
});
