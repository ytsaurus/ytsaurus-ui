import {expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../utils';
import {BasePage} from '../../widgets/BasePage';

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
        await this.page.getByRole('button', {name: 'ACL'}).click();
    }
}

test('@ACO: the permissions request button should be visible', async ({page}) => {
    const acoPage = new ACOPage({page});

    await acoPage.open();

    await page.evaluate(() => {
        //@ts-expect-error
        window.__DATA__.uiSettings.reUseEffectiveAclForPath = undefined;
    });

    await acoPage.waitForACLTableLoad();

    await expect(page.getByText('Add ACL')).toBeVisible();
});

test('@ACO: the permissions request button should be hidden', async ({page}) => {
    const acoPage = new ACOPage({page});

    await acoPage.open();
    await acoPage.clickOnACLTab();
    await acoPage.waitForACLTableLoad();

    await expect(page.getByText('Add ACL')).toBeHidden();
});
