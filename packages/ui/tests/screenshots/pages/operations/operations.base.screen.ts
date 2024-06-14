import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';
import {replaceInnerHtml, setDisplayNone} from '../../../utils/dom';

class OperationsPage extends BasePage {
    async waitForRunningOperation() {
        await this.page.waitForSelector(
            '.operations-list__table-item_type_progress :text("Running")',
        );
    }

    async replaceListTimes() {
        await replaceInnerHtml(this.page, {
            '.operations-list__item-start-time-human': '000 minutes ago',
            '.operations-list__item-start-time-default': '01 Jan 1970 00:00:00',
            '.operations-list__item-duration': '00:00:00',
        });
    }

    async replaceMetaData() {
        await replaceInnerHtml(this.page, {
            '.meta-table-item__value_key_id .meta-table-item__id .elements-ellipsis':
                '00000000-11111111-22222-33333333',
            '.meta-table-item__value_key_started .meta-table-item__time': '01 Jan 1970 00:00:00',
            '.meta-table-item__value_key_duration .meta-table-item__time': '00:00:00',
        });
    }

    async replaceDetailsSectionData() {
        await replaceInnerHtml(this.page, {
            '.meta-table-item__value_key_hostname': 'my-host.my-domain',
            '.meta-table-item__value_key_pid': '00.00.00',
            '.meta-table-item__value_key_platform': 'unknown',
            '.meta-table-item__value_key_user': 'guest',
            '.meta-table-item__value_key_python_version': '00.00.00',
            '.meta-table-item__value_key_wrapper_version': '00.00.00',
            '.meta-table-item__value_key_command .unipika .string': {
                regex: "span>'?[^>]+/yt'? vanilla ",
                replacement: 'span>/usr/bin/local/yt vanilla ',
            },
        });
    }

    async replaceJobsData() {
        await replaceInnerHtml(this.page, {
            '.operation-detail-jobs__id-job-link': '00000000-11111111-22222-33333333',
            '.operation-detail-jobs__start-time': '01 Jan 1970 00:00:00',
            '.operation-detail-jobs__table-item_type_duration': '00:00:00',
        });
    }

    async waitForStatisticsRows() {
        await this.page.waitForSelector('.elements-table__row :text("meta_bytes_read_from_disk")');
    }

    async hideMetaByEnv() {
        const {OPERATION_DETAILS_HIDE_META_BY_KEY: keysAsStr = ''} = process.env;
        const keys = keysAsStr.split(',').filter(Boolean);
        const selectors = keys.reduce((acc, k) => {
            acc.push(`.meta-table-item__key_key_${k}`, `.meta-table-item__value_key_${k}`);
            return acc;
        }, [] as Array<string>);
        setDisplayNone(this.page, selectors);
    }
}

const operationsPage = (page: Page) => new OperationsPage({page});

test('Operations - List', async ({page}) => {
    await page.goto(makeClusterUrl(`operations`));

    await operationsPage(page).waitForRunningOperation();
    await operationsPage(page).replaceListTimes();

    await expect(page).toHaveScreenshot();
});

test('Operation - Details', async ({page}) => {
    await page.goto(makeClusterUrl(`operations/*long-operation`));

    await operationsPage(page).replaceMetaData();
    await operationsPage(page).replaceDetailsSectionData();
    await operationsPage(page).hideMetaByEnv();

    await expect(page).toHaveScreenshot();
});

test('Operation - Statistics', async ({page}) => {
    await page.goto(makeClusterUrl(`operations/*long-operation/statistics`));

    await operationsPage(page).replaceMetaData();
    await operationsPage(page).waitForStatisticsRows();

    await expect(page).toHaveScreenshot();
});

test('Operation - Jobs', async ({page}) => {
    await page.goto(makeClusterUrl(`operations/*long-operation/jobs`));

    await operationsPage(page).replaceMetaData();
    await operationsPage(page).replaceJobsData();

    await expect(page).toHaveScreenshot();
});
