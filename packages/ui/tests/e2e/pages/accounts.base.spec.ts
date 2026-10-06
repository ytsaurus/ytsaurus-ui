// eslint-disable-next-line @typescript-eslint/no-redeclare
import {expect, test} from '@playwright/test';
import type {Page} from '@playwright/test';
import {E2E_SUFFIX, makeClusterTille, makeClusterUrl} from '../../utils';

async function openAccountEditor(page: Page, account: string) {
    await page.getByTestId(`edit-account-${account}`).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    return dialog;
}

async function selectAccountEditorPage(page: Page, name: string) {
    await page.getByRole('dialog').getByText(name, {exact: true}).click();
}

test('Accounts - General as default page', async ({page}) => {
    await page.goto(makeClusterUrl('accounts'));

    await page.waitForSelector(':text("account-for-e2e")');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Accounts'}));
    await expect(page).toHaveURL(makeClusterUrl('accounts/general'));
});

test('Accounts - General filter', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general'));

    await page.fill('[data-qa="accounts-name-filter"] input', 'account-for-e2e');
    await page.waitForTimeout(100);

    await expect(page).toHaveTitle(makeClusterTille({page: 'Accounts'}));
    await expect(page).toHaveURL(makeClusterUrl('accounts/general?filter=account-for-e2e'));

    const rowCount = await page.$eval('.accounts__table tbody', (node) => node.childElementCount);
    expect(rowCount).toBe(1);
});

test('Accounts - General open with filter', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general?filter=account-for-e2e'));

    await page.waitForSelector(':text("account-for-e2e")');
    const rowCount = await page.$eval('.accounts__table tbody', (node) => node.childElementCount);
    expect(rowCount).toBe(1);

    await page.click(':text("account-for-e2e")');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Accounts'}));
    await expect(page).toHaveURL(makeClusterUrl('accounts/general?account=account-for-e2e'));
});

test('Accounts - Editor', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general?account=account-for-e2e'));

    const dialog = await openAccountEditor(page, 'account-for-e2e');
    await selectAccountEditorPage(page, 'Nodes');
    await page.click('.account-quota__edit');

    const limitInput = await page.waitForSelector('[data-qa="quota-editor-new-limit"] input');
    const value = await limitInput.inputValue();
    const newValue = value === '123' ? '111' : '123';
    await page.fill('[data-qa="quota-editor-new-limit"] input', newValue);
    await page.click('[data-qa="quota-editor-save"]');
    await page.click('[data-qa="quota-editor-confirmation-yes"]');

    await page.waitForTimeout(200);

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);

    await page.click('[data-qa="accounts-content-mode"]');
    await page.click('[data-qa="select-list"] :text("Nodes")');

    await page.waitForSelector(`.accounts__table-item_type_node-count-limit :text("${newValue}")`);

    await expect(page).toHaveTitle(makeClusterTille({page: 'Accounts'}));
    await expect(page).toHaveURL(
        makeClusterUrl('accounts/general?mode=nodes&account=account-for-e2e'),
    );
});

test('Account - Editor: Nodes min limit', async ({page}) => {
    const account = `e2e-parent-${E2E_SUFFIX}`;

    await page.goto(makeClusterUrl(`accounts/general?account=${account}`));

    await openAccountEditor(page, account);
    await selectAccountEditorPage(page, 'Nodes');
    await page.click('.account-quota__edit');

    await page.fill('[data-qa="quota-editor-new-limit"] input', '1');

    await page.waitForSelector(':text("The value must be ≥ 11")');
});

test('Account - Editor: Nodes min limit with overcommit', async ({page}) => {
    const account = `e2e-overcommit-${E2E_SUFFIX}`;

    await page.goto(makeClusterUrl(`accounts/general?account=${account}`));

    await openAccountEditor(page, account);
    await selectAccountEditorPage(page, 'Nodes');
    await page.click('.account-quota__edit');

    await page.fill('[data-qa="quota-editor-new-limit"] input', '1');

    await page.waitForSelector(':text("The value must be ≥ 6")');
});
