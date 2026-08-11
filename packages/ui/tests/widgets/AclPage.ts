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
        await Promise.all([
            this.page.waitForLoadState('load'),
            this.page.waitForLoadState('networkidle'),
            this.page.evaluate(() => document.fonts.ready),
            this.waitForCSS('.navigation-acl__table-item_type_subjects', {'max-width': '320px'}),
        ]);
    }

    async waitForClusterFontWeight() {
        await this.waitForCSS('.navigation-acl__table-item_type_subjects', {'font-weight': '500'});
    }
}

export function aclPage(page: Page) {
    return new AclPage({page});
}
