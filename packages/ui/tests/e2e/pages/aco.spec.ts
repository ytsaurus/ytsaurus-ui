import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../utils';
import {BasePage} from '../utils/BasePage';

class ACOPage extends BasePage {
    async open() {
        await this.page.goto(
            makeClusterUrl(
                'navigation?navmode=acl&path=//sys/access_control_object_namespaces/queries',
            ),
        );
    }
    async waitForACLTableLoad() {
        await expect(this.page.getByText('Object permissions').nth(1)).toBeVisible();
    }

    async clickOnACLTab() {
        await this.page.getByText('ACL').click();
    }
}

test('@ACO: the permissions request button should be visible', async ({page, context}) => {
    const acoPage = new ACOPage({page});

    await acoPage.open();

    await page.evaluate(() => {
        //@ts-expect-error
        window.__DATA__.uiSettings.reUseEffectiveAclForPath = undefined;
    });

    await acoPage.clickOnACLTab();
    await acoPage.waitForACLTableLoad();

    await expect(page.getByText('Request permissions')).toBeVisible();
});

test('@ACO: the permissions request button should be hidden', async ({page, context}) => {
    const acoPage = new ACOPage({page});

    await acoPage.open();
    await acoPage.clickOnACLTab();
    await acoPage.waitForACLTableLoad();

    await expect(page.getByText('Request permissions')).toBeHidden();
});
