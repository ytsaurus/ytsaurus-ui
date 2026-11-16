import {type Page} from '@playwright/test';
import {BasePage} from './BasePage';

export class AclPage extends BasePage {
    locator(locator?: string) {
        if (locator) {
            return this.page.locator('.navigation-acl').locator(locator);
        }
        return this.page.locator('.navigation-acl');
    }

    async waitForStyles() {
        await this.locator('.navigation-acl__acl-actions').waitFor({state: 'attached'});
        await this.locator('.navigation-acl__object-permissions').waitFor({state: 'visible'});
        await this.page.evaluate(() => document.fonts.ready);
    }

    async waitForClusterFontWeight() {
        await this.waitForCSS('.navigation-acl__table-item_type_subjects', {'font-weight': '500'});
    }
}

export function aclPage(page: Page) {
    return new AclPage({page});
}
