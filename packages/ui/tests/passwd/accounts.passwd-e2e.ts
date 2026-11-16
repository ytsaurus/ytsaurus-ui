import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../utils';

const account = 'account-permission-denied-e2e';

test('Accounts: user cannot change the chunk quota', async ({page}) => {
    await page.goto(makeClusterUrl(`accounts/general?account=${account}`));
    await page.getByTestId(`edit-account-${account}`).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByText('Chunks', {exact: true}).click();
    // The pencil control has no accessible name or public test id.
    await dialog.locator('.account-quota__edit').click();
    await dialog.getByTestId('quota-editor-new-limit').locator('input').fill('2000');
    await dialog.getByTestId('quota-editor-save').click();
    await dialog.getByTestId('quota-editor-confirmation-yes').click();

    await expect(
        page.getByText(`permission for account "${account}" is not allowed by any matching ACE`, {
            exact: false,
        }),
    ).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await page.getByTestId(`edit-account-${account}`).click();
    await dialog.getByText('Chunks', {exact: true}).click();
    await dialog.locator('.account-quota__edit').click();
    await expect(dialog.getByTestId('quota-editor-new-limit').locator('input')).toHaveValue(
        /^1\s000$/,
    );
});
