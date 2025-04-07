import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';

const PATH = `${E2E_DIR}/queue`;

test('Queue: create export', async ({page, context}) => {
    test.slow();

    await page.goto(
        makeClusterUrl(`navigation?offsetMode=key&qMode=exports&navmode=queue&path=${PATH}`),
    );

    await page.getByTestId('create-export').click();
    await page
        .locator('.df-dialog__field-group_type_path .g-text-input__control_type_input')
        .fill(E2E_DIR);
    await page.locator('button[type="submit"]').click();

    await page.locator('input[value="exports"]').click({timeout: 5000});
    await page.getByTestId('edit-export').click();
    await page.locator('input[value="30s "]').fill('1234567000');
    await page.locator('button[type="submit"]').click();
    await expect(page.getByText('1234567000', {exact: true})).toBeVisible();

    const pathCell = page.getByText(E2E_DIR, {exact: true});
    await expect(pathCell).toBeVisible();
    await pathCell.click();

    const originatingQueue = page.locator('li[title="Originating queue"]');
    await expect(originatingQueue).toBeVisible();

    const [newPage] = await Promise.all([context.waitForEvent('page'), originatingQueue.click()]);

    await newPage.waitForLoadState('load');

    await expect(newPage).toHaveURL(makeClusterUrl(`navigation?path=${PATH}`));
});
