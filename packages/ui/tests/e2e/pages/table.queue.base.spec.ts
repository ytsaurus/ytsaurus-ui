import {expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';

const PATH = `${E2E_DIR}/queue`;

test('Queue: update existing export', async ({page}) => {
    test.slow();

    await page.goto(makeClusterUrl(`navigation?offsetMode=key&qMode=exports&navmode=queue&path=${PATH}`));

    await page.locator('.exports-edit__button').click();

    await page.locator('.df-dialog__field-group_type_time-duration .g-text-input__control').fill('1000');

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.structured-yson-virtualized__row_key_export_ttl .number')).toHaveText('1000', {timeout: 30000});
});
