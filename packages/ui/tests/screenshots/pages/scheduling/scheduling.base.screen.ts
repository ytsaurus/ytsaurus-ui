import {Page, expect, test} from '@playwright/test';
import {makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../widgets/BasePage';
import {replaceInnerHtml} from '../../../utils/dom';

class Scheduling extends BasePage {
    async waitForLoadedPool() {
        await this.page.waitForSelector('.elements-table__row :text("yt-e2e-pool-1")');
    }

    async setDetailsMode(
        mode: 'CPU' | 'Memory' | 'GPU' | 'User slots' | 'Operations' | 'Integral guarantees',
    ) {
        await this.page.click(`.scheduling-details__toolbar :text("${mode}")`, {force: true});
    }

    async replaceEstimatedGuarantee(type: 'cpu' | 'memory') {
        await replaceInnerHtml(this.page, {
            [`tbody .scheduling-details__table-item_type_abs-guaranteed-${type}`]: '0.00',
        });
    }

    async showPoolEditor(pool: string) {
        const editBtn = await this.page.getByTitle(`edit pool ${pool}`);
        await editBtn.scrollIntoViewIfNeeded();
        await editBtn.click();
    }
}

const scheduling = (page: Page) => new Scheduling({page});

test('Scheduling - Overview', async ({page}) => {
    await page.goto(makeClusterUrl(`scheduling/overview?pool=yt-e2e-pool-1&tree=default`));

    await scheduling(page).waitForLoadedPool();

    await expect(page).toHaveScreenshot();
});

test('Scheduling - ACL', async ({page}) => {
    await page.goto(makeClusterUrl(`scheduling/acl?pool=yt-e2e-pool-1&tree=default`));

    await scheduling(page).waitForACL();

    await expect(page).toHaveScreenshot();

    await page.click('.acl-request-permissions button');
    await page.waitForSelector('.g-dialog');
    await expect(page).toHaveScreenshot();
    await page.click('button[aria-label="Close dialog"]');

    await page.click('.acl-inheritance button');
    await page.waitForSelector('.g-dialog');
    await expect(page).toHaveScreenshot();
});

test('Scheduling - Details', async ({page}) => {
    await page.goto(
        makeClusterUrl(`scheduling/details?pool=yt-e2e-pool-1&tree=default&contentMode=cpu`),
    );

    await scheduling(page).waitForLoadedPool();

    await test.step('CPU', async () => {
        await scheduling(page).replaceEstimatedGuarantee('cpu');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Memory', async () => {
        await scheduling(page).setDetailsMode('Memory');
        await scheduling(page).replaceEstimatedGuarantee('memory');
        await expect(page).toHaveScreenshot();
    });

    await test.step('GPU', async () => {
        await scheduling(page).setDetailsMode('GPU');
        await expect(page).toHaveScreenshot();
    });

    await test.step('User slots', async () => {
        await scheduling(page).setDetailsMode('User slots');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Operations', async () => {
        await scheduling(page).setDetailsMode('Operations');
        await expect(page).toHaveScreenshot();
    });

    await test.step('Integral guarantees', async () => {
        await scheduling(page).setDetailsMode('Integral guarantees');
        await expect(page).toHaveScreenshot();
    });
});

test('Scheduling - Editor', async ({page}) => {
    await page.goto(
        makeClusterUrl(`scheduling/details?pool=yt-e2e-pool-1&tree=default&contentMode=cpu`),
    );

    await scheduling(page).showPoolEditor('yt-e2e-pool-1');

    await test.step('General', async () => {
        await scheduling(page).dfDialog.waitForField('Max running operation count');

        await expect(page).toHaveScreenshot();
    });

    await test.step('Strong Guarantee', async () => {
        await scheduling(page).dfDialog.showTab('Strong Guarantee');
        await scheduling(page).dfDialog.waitForField('CPU');

        await expect(page).toHaveScreenshot();
    });

    await test.step('Integral Guarantee', async () => {
        await scheduling(page).dfDialog.showTab('Integral Guarantee');
        await scheduling(page).dfDialog.waitForField('Burst CPU');

        await expect(page).toHaveScreenshot();
    });

    await test.step('Resource limits', async () => {
        await scheduling(page).dfDialog.showTab('Resource limits');
        await scheduling(page).dfDialog.waitForField('User slots');

        await expect(page).toHaveScreenshot();
    });

    await test.step('Other settings', async () => {
        await scheduling(page).dfDialog.showTab('Other settings');
        await scheduling(page).dfDialog.waitForField('Create ephemeral subpools');

        await expect(page).toHaveScreenshot();
    });
});
