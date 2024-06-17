import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';

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
});
