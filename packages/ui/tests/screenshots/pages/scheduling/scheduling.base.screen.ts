import {Page, expect, test} from '@playwright/test';
import {MOCK_DATE, makeClusterUrl} from '../../../utils';
import {BasePage} from '../../../widgets/BasePage';
import {replaceInnerHtml} from '../../../utils/dom';

class Scheduling extends BasePage {
    async waitForLoadedPool() {
        await this.page.waitForSelector('.yt-scheduling-table tr :text("yt-e2e-pool-1")');
    }

    async setDetailsMode(
        mode: 'CPU' | 'Memory' | 'GPU' | 'User slots' | 'Operations' | 'Integral guarantees',
    ) {
        await this.page
            .locator('.yt-scheduling-toolbar')
            .getByRole('radiogroup')
            .getByText(`${mode}`)
            .click({force: true});
    }

    async replaceEstimatedGuarantee(type: 'cpu' | 'memory') {
        await replaceInnerHtml(this.page, {
            [`tbody .gt-table__cell_id_abs_guaranteed_${type}`]: '0.00',
        });
    }

    async showPoolEditor(rowNumber: number) {
        await this.page.locator(`tr:nth-child(${rowNumber}) .yt-scheduling-table__actions`).click();
        // without the timeout the page might be horizontally scrolled
        await this.page.waitForTimeout(400);
        await this.page.getByRole('menuitem').getByText('Edit').click();
    }
}

const scheduling = (page: Page) => new Scheduling({page});

test('Scheduling - ACL', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
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

test('Scheduling - Summary', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(
        makeClusterUrl(`scheduling/overview?pool=yt-e2e-pool-1&tree=default&contentMode=cpu`),
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
    await page.clock.install({time: MOCK_DATE});
    await page.goto(
        makeClusterUrl(`scheduling/overview?pool=yt-e2e-pool-1&tree=default&contentMode=cpu`),
    );

    await scheduling(page).showPoolEditor(1);
    await page.waitForLoadState('networkidle');

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
