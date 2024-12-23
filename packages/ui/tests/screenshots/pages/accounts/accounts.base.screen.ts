import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';
import {replaceInnerHtml} from '../../../utils/dom';

const HARDWARE_LIMIT = '000.00 GiB';
const ACCOUNT_NAME_RULE = {'.accounts__item-name .g-link': 'e2e_XXXXXX_XXXXX'};
const PROGRESS_TEXT_WITH_SIZE_RULE = {'.g-progress .g-progress__text': '0 B + 0 B / 00.00 TiB'};
const PROGRESS_SIZE_RULE = {'.g-progress__text-inner': '0 B + 0 B / 00.00 TiB'};

class AccountsPage extends BasePage {
    async waitAccountRow() {
        await this.page.waitForSelector('.accounts__content tr :text("account-for-e2e")');
    }

    async selectMode(
        mode:
            | 'Disk space'
            | 'Nodes'
            | 'Chunks'
            | 'Tablets memory'
            | 'Master memory'
            | 'Master memory detailed',
    ) {
        await this.page.getByTestId('accounts-content-mode').click();
        await this.page.click(`.g-select-list__option :text("${mode}")`, {force: true});
        await this.page.mouse.move(0, 0);
    }

    async showEditor(account: string) {
        await this.page.getByTestId(`edit-account-${account}`).click();
        await this.page.waitForSelector('.accounts-editor__edit');
    }

    async selectEditorPage(name: 'Disk space' | 'Nodes' | 'Chunks' | 'Master memory' | 'Delete') {
        await this.page.click(`.accounts-editor__edit-tabs :text("${name}")`, {force: true});
        await this.page.mouse.move(0, 0);
    }

    async changeListMode(itemId: string) {
        await this.page.click('.accounts__content-mode');
        await this.page.waitForSelector('.g-popup_open');
        await this.page.click(`div[id="${itemId}"]`);
        await this.page.waitForSelector('.g-popup', {state: 'hidden'});
    }

    async fixProgress() {
        await this.page.evaluate(() => {
            const progress = document.querySelectorAll<HTMLDivElement>(
                '.g-progress__item_theme_success',
            );
            progress.forEach((item) => {
                item.style.width = '60%';
            });
        });
    }

    async prepareListPage() {
        await this.fixProgress();
        await replaceInnerHtml(this.page, {
            ...ACCOUNT_NAME_RULE,
            ...PROGRESS_TEXT_WITH_SIZE_RULE,
            'td.accounts__disk-space-hardware-limit': HARDWARE_LIMIT,
            'td.accounts__table-item_type_disk-space-default': '-',
            'td.accounts__disk-space-read-throughput': '-',
            'td.accounts__disk-space-write-throughput': '-',
        });
    }

    async prepareDiskSpaceList() {
        await replaceInnerHtml(this.page, {
            ...ACCOUNT_NAME_RULE,
            ...PROGRESS_TEXT_WITH_SIZE_RULE,
            'td.accounts__disk-space-hardware-limit': HARDWARE_LIMIT,
            '.accounts__bytes .accounts__item': '0 B',
            '.accounts__bytes small': '00 000',
            'td.accounts__disk-space-read-throughput': '-',
            'td.accounts__disk-space-write-throughput': '-',
        });
    }

    async prepareNodeList() {
        await this.fixProgress();
        await replaceInnerHtml(this.page, {
            ...ACCOUNT_NAME_RULE,
            ...PROGRESS_TEXT_WITH_SIZE_RULE,
            ...PROGRESS_SIZE_RULE,
            '.accounts__table-item_type_node-count-usage .accounts__item': '000',
            '.accounts__table-item_type_node-count-limit .accounts__item': '000 000',
            '.accounts__table-item_type_node-count-free .accounts__item': '000 000',
        });
    }

    async prepareChunksList() {
        await replaceInnerHtml(this.page, {
            ...ACCOUNT_NAME_RULE,
            ...PROGRESS_TEXT_WITH_SIZE_RULE,
            '.accounts__table-item_type_chunk-count-usage .accounts__item': '0',
            '.accounts__table-item_type_chunk-count-limit .accounts__item': '0',
            '.accounts__table-item_type_chunk-count-free .accounts__item': '0',
        });
    }

    async prepareMasterMemoryList() {
        await this.fixProgress();
        await replaceInnerHtml(this.page, {
            ...ACCOUNT_NAME_RULE,
            ...PROGRESS_TEXT_WITH_SIZE_RULE,
            ...PROGRESS_SIZE_RULE,
            '.accounts__bytes .accounts__item': '0 B',
            '.accounts__bytes small': '00 000',
        });
    }

    async prepareMasterMemoryDetailedList() {
        await replaceInnerHtml(this.page, {
            ...ACCOUNT_NAME_RULE,
            '.accounts__bytes .accounts__item': '0 B',
            '.accounts__bytes small': '00 000',
        });
    }
}

const accounts = (page: Page) => new AccountsPage({page});

test('Accounts - General', async ({page}) => {
    await page.goto(makeClusterUrl(`accounts/general?account=account-for-e2e`));

    await test.step('default', async () => {
        await accounts(page).waitAccountRow();
        await expect(page).toHaveScreenshot();
    });

    await test.step('Disk space', async () => {
        await accounts(page).selectMode('Disk space');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Nodes', async () => {
        await accounts(page).selectMode('Nodes');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Chunks', async () => {
        await accounts(page).selectMode('Chunks');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Master memory', async () => {
        await accounts(page).selectMode('Master memory');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Master memory', async () => {
        await accounts(page).selectMode('Master memory detailed');
        await expect(page).toHaveScreenshot();
    });
});

test('Accounts - Editor', async ({page}) => {
    await page.goto(makeClusterUrl(`accounts/general?account=account-for-e2e`));

    await accounts(page).showEditor('account-for-e2e');

    await test.step('General', async () => {
        await expect(page).toHaveScreenshot();
    });

    await test.step('Disk space', async () => {
        await accounts(page).selectEditorPage('Disk space');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Nodes', async () => {
        await accounts(page).selectEditorPage('Nodes');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Chunks', async () => {
        await accounts(page).selectEditorPage('Chunks');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Master memory', async () => {
        await accounts(page).selectEditorPage('Master memory');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Delete', async () => {
        await accounts(page).selectEditorPage('Delete');
        await expect(page).toHaveScreenshot();
    });
});

test('Accounts - ACL', async ({page}) => {
    await page.goto(makeClusterUrl(`accounts/acl?account=account-for-e2e`));
    await accounts(page).waitForACL();

    await expect(page).toHaveScreenshot();

    await page.click('.acl-request-permissions button');
    await page.waitForSelector('.g-dialog');
    await expect(page).toHaveScreenshot();
});

test('Accounts - List', async ({page}) => {
    await page.goto(makeClusterUrl(`accounts/general?sortState=asc-false,field-name`));
    await page.waitForSelector('.elements-table');
    await page.fill('span[data-qa="accounts-name-filter"] input', 'e2e');

    await accounts(page).prepareListPage();
    await expect(page).toHaveScreenshot();

    await accounts(page).changeListMode('select-popup-g-:rl:-item-1');
    await accounts(page).prepareDiskSpaceList();
    await expect(page).toHaveScreenshot();

    await accounts(page).changeListMode('select-popup-g-:rl:-item-2');
    await accounts(page).prepareNodeList();
    await expect(page).toHaveScreenshot();

    await accounts(page).changeListMode('select-popup-g-:rl:-item-3');
    await accounts(page).prepareChunksList();
    await expect(page).toHaveScreenshot();

    await accounts(page).changeListMode('select-popup-g-:rl:-item-6');
    await accounts(page).prepareMasterMemoryList();
    await expect(page).toHaveScreenshot();

    await accounts(page).changeListMode('select-popup-g-:rl:-item-7');
    await accounts(page).prepareMasterMemoryDetailedList();
    await expect(page).toHaveScreenshot();
});
