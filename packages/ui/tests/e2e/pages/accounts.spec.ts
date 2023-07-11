import {expect, test} from '@playwright/test';
import {CLUSTER, makeClusterTille, makeClusterUrl} from '../utils';

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

test('Accounts - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general?account=account-for-e2e'));

    await page.waitForSelector(
        `a:text("My monitoring")[href="https://my.monitoring.service/accounts?cluster=${CLUSTER}&account=account-for-e2e"]`,
    );
});

test('Accounts - Editor', async ({page}) => {
    await page.goto(makeClusterUrl('accounts/general?account=account-for-e2e'));

    await page.click('[data-qa="edit-account-account-for-e2e"]');
    await page.click('.accounts-editor__edit-tabs :text("Nodes")');
    await page.click('.account-quota__edit');

    const limitInput = await page.waitForSelector('[data-qa="quota-editor-new-limit"] input');
    const value = await limitInput.inputValue();
    const newValue = value === '123' ? '111' : '123';
    await page.fill('[data-qa="quota-editor-new-limit"] input', newValue);
    await page.click('[data-qa="quota-editor-save"]');
    await page.click('[data-qa="quota-editor-confirmation-yes"]');

    await page.waitForTimeout(100);

    await page.click('.elements-modal__close button');

    await page.click('[data-qa="accounts-content-mode"]');
    await page.click('[data-qa="select-list"] :text("Nodes")');

    await page.waitForSelector(`.accounts__table-item_type_node-count-limit :text("${newValue}")`);

    await expect(page).toHaveTitle(makeClusterTille({page: 'Accounts'}));
    await expect(page).toHaveURL(
        makeClusterUrl('accounts/general?mode=nodes&account=account-for-e2e'),
    );
});
