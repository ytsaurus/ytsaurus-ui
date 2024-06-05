import {Page} from '@playwright/test';
import {E2E_DIR_NAME} from '../../../utils';
import {BasePage} from '../../../utils/BasePage';
import {replaceInnerHtml, replaceInnerHtmlForDateTime} from '../../../utils/dom';

class NavigationPage extends BasePage {
    async replaceNameOfTestDir() {
        await replaceInnerHtml(this.page, {
            [`[title="${E2E_DIR_NAME}"] .unipika .string`]: 'e2e.1970-01-01.00:00:00.xxxxxxxxxxx',
        });
    }

    async replaceAttributes() {
        await replaceInnerHtml(this.page, {
            '.structured-yson-virtualized__row_key_id .structured-yson-virtualized__value':
                '0-00-00000-ffffffff',
            '.structured-yson-virtualized__row_key_revision .uint64': '1111111111',
            '.structured-yson-virtualized__row_key_attribute_revision .uint64': '2222222222',
            '.structured-yson-virtualized__row_key_content_revision .uint64': '2222222222',
        });
    }

    async replaceMapNodeDateTimes(rowCount: number) {
        await this.page.waitForSelector(
            `tr:nth-child(${rowCount}) .map-node_default__table-item_type_modification-time`,
        );

        await replaceInnerHtmlForDateTime(this.page, [
            'td.map-node_default__table-item_type_modification-time',
            'td.map-node_default__table-item_type_creation-time',
        ]);
    }

    async replaceMapNodeAccounts(rowCount: number) {
        await this.page.waitForSelector(
            `tr:nth-child(${rowCount}) .map-node_default__table-item_type_account`,
        );

        await replaceInnerHtml(this.page, {'td.map-node_default__table-item_type_account': 'tmp'});
    }

    async replaceLocksContent() {
        await replaceInnerHtmlForDateTime(this.page, ['.meta-table-item__time']);
        await replaceInnerHtml(this.page, {
            '.navigation-locks__id': '1-222-33333-4444',
        });

        await this.replaceNameOfTestDir();
    }

    async waitForACL() {
        await this.page.waitForSelector('.navigation-acl__row .yt-subject-link');
    }
}

export function navigationPage(page: Page) {
    return new NavigationPage({page});
}
