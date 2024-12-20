import {expect, test} from '@playwright/test';
import {E2E_OPERATION_ID, makeClusterUrl} from '../../../utils';
import {
    replaceInnerHtml,
    replaceInnerHtmlForDateTime,
    replaceInnerHtmlForDuration,
    replaceInnerHtmlForId,
    replaceInnerHtmlForIsoDate,
} from '../../../utils/dom';

test('Job - Details', async ({page}) => {
    test.slow();

    await page.goto(makeClusterUrl(`operations/${E2E_OPERATION_ID}/jobs`));

    await test.step('Details', async () => {
        await page.click('.operation-detail-jobs__id-job-link');

        replaceInnerHtml(page, {
            '.operation-detail__events-progress-percentage': 'X.X1X%',
            '.operation-detail__events-progress .g-progress': '',
        });

        await replaceInnerHtmlForDateTime(page, [
            '.events__table-item_type_start-time .meta-table-item__time',
            '.meta-table-item__value_key_started .meta-table-item__time',
            '.meta-table-item__value_key_finished .meta-table-item__time',
        ]);

        await replaceInnerHtmlForDuration(page, [
            '.events__table-item_type_duration .meta-table-item__time',
            '.meta-table-item__value_key_duration .meta-table-item__time',
        ]);

        await page.waitForSelector('.meta-table-item__value_key_operation_id a');

        await replaceInnerHtmlForId(page, [
            '.meta-table-item__value_key_operation_id a',
            '.meta-table-item__value_key_job_id .elements-ellipsis',
        ]);

        await expect(page).toHaveScreenshot();
    });

    await test.step('Attributes', async () => {
        await page.click('.tabs :text("Attributes")');

        replaceInnerHtml(page, {
            '.structured-yson-virtualized__row_key_address .structured-yson-virtualized__value':
                'localhost:XXXXXx',
        });

        replaceInnerHtmlForIsoDate(page, [
            '.structured-yson-virtualized__row_key_start_time .structured-yson-virtualized__value',
            '.structured-yson-virtualized__row_key_finish_time .structured-yson-virtualized__value',
        ]);

        replaceInnerHtmlForId(page, [
            '.structured-yson-virtualized__row_key_job_id .structured-yson-virtualized__value',
            '.structured-yson-virtualized__row_key_operation_id .structured-yson-virtualized__value',
            '.structured-yson-virtualized__row_key_job_competition_id .structured-yson-virtualized__value',
            '.structured-yson-virtualized__row_key_probing_job_competition_id .structured-yson-virtualized__value',
        ]);

        await expect(page).toHaveScreenshot();
    });

    await test.step('Statistics', async () => {
        await page.click('.tabs :text("Statistics")');

        await page.waitForSelector('.job-statistics__table-container .job-statistics__group');

        await expect(page).toHaveScreenshot();
    });

    await test.step('Specification', async () => {
        await page.click('.tabs :text("Specification")');

        await page.waitForSelector('.structured-yson-virtualized__row_key_io_config');

        await expect(page).toHaveScreenshot();
    });
});
