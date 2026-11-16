import {type Page} from '@playwright/test';
import {BasePage} from './BasePage';
import {replaceInnerHtml, replaceInnerHtmlForDateTime} from '../utils/dom';

export class NavigationPage extends BasePage {
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

    async replaceMapNodeBytes() {
        await replaceInnerHtml(this.page, {
            'tbody .map-node_default__table-item_type_disk-space': '00.00 KiB',
        });
    }

    async replaceLocksContent() {
        await replaceInnerHtmlForDateTime(this.page, ['.meta-table-item__time']);
        await replaceInnerHtml(this.page, {
            '.navigation-locks__id': '1-222-33333-4444',
        });

        await this.replaceBreadcrumbsTestDir();
    }

    async mapNodeCreateObject(hasText: 'Table' | 'Directory' | 'Link', path?: string) {
        await this.page
            .getByRole('table')
            .or(this.page.getByText('No items to show', {exact: true}))
            .waitFor({state: 'visible'});
        await this.page
            .locator('.elements-table__no-data-placeholder')
            .first()
            .waitFor({state: 'hidden'});
        await this.page.evaluate(() => document.fonts.ready);

        await this.page.getByRole('button', {name: 'Create object', exact: true}).click();
        await this.page.getByRole('menuitem').filter({hasText}).click();

        if (path) {
            await this.page.locator('.path-editor-modal .g-text-input input').fill(path);
            await this.page.getByTestId('modal-confirm').click();
            await this.page.getByText(path).waitFor({state: 'visible'});
        }
    }

    async gotToPath(path: string) {
        await this.page.getByTestId('edit-text-button').first().click();
        await this.page.fill('.path-editor input', path);
        await this.page.keyboard.press('Enter');
    }
}

export function navigationPage(page: Page) {
    return new NavigationPage({page});
}
