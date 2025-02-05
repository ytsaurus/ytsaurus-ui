import {NavigationPage} from './NavigationPage';
import {replaceInnerHtml} from '../../../utils/dom';
import type {Locator} from '@playwright/test';

export class TablePage extends NavigationPage {
    async waitForTableContent(selector: string, rowCount: number) {
        await this.waitForTable(selector, rowCount);
        await this.page.waitForSelector(':text("Data weight")');
        await this.waitForTableSyncedWidth(selector);
    }

    async replaceTableMeta() {
        await this.replaceBreadcrumbsTestDir();
        await replaceInnerHtml(this.page, {
            '[data-qa="expiration_timeout_path"]': 'e2e.1970-01-01.00:00:00.xxxxxxxxxxx',
            '.meta-table-item__time': '01 Jan 1970 00:00:00',
            '.meta-table-item__id': '0-11111-22222-33333333',
            '.meta-table-item__value_format_bytes': '00.00 KiB',
        });
    }

    async openCellPreviewDialog(column: Locator) {
        await column.hover();

        const eyeIcon = column.getByTestId('truncated-preview-button');

        await eyeIcon.click();
    }
}
