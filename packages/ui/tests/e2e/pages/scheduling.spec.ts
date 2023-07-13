import {expect, test} from '@playwright/test';
import {CLUSTER, makeClusterTille, makeClusterUrl} from '../utils';

test('Scheduliing - Overview', async ({page}) => {
    await page.goto(makeClusterUrl('scheduling'));

    await page.waitForSelector('text="yt-e2e-pool-1"');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Scheduling'}));
    await expect(page).toHaveURL(makeClusterUrl('scheduling/overview?tree=default'));

    const rowCount = await page.$eval(
        '.scheduling-overview__table tbody',
        (node) => node.childElementCount,
    );
    expect(rowCount).toBeGreaterThan(1);

    await page.click('text="yt-e2e-pool-1"');
    await page.waitForSelector('text="Guarantee type"');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Scheduling'}));
    await expect(page).toHaveURL(
        makeClusterUrl('scheduling/overview?pool=yt-e2e-pool-1&tree=default'),
    );

    const rowCount2 = await page.$eval(
        '.scheduling-overview__table tbody',
        (node) => node.childElementCount,
    );
    expect(rowCount2).toBe(1);
});

test('Scheduliing - Details', async ({page}) => {
    await page.goto(makeClusterUrl('scheduling/details'));

    await page.waitForSelector('text="yt-e2e-pool-1"');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Scheduling'}));
    await expect(page).toHaveURL(makeClusterUrl('scheduling/details?tree=default'));

    const rowCount = await page.$eval(
        '.scheduling-details__table tbody',
        (node) => node.childElementCount,
    );
    expect(rowCount).toBeGreaterThan(1);

    await page.click('text="yt-e2e-pool-1"');
    await page.waitForSelector('.scheduling-details__table-row_current_yes');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Scheduling'}));
    await expect(page).toHaveURL(
        makeClusterUrl('scheduling/details?pool=yt-e2e-pool-1&tree=default'),
    );

    const rowCount2 = await page.$eval(
        '.scheduling-details__table tbody',
        (node) => node.childElementCount,
    );
    expect(rowCount2).toBe(1);
});

test('Scheduling - Monitoring', async ({page}) => {
    await page.goto(makeClusterUrl('scheduling/overview?pool=yt-e2e-pool-1&tree=default'));

    await page.waitForSelector('text="yt-e2e-pool-1"');
    await page.waitForSelector(
        `a:text("My monitoring")[href="https://monitoring-service.my-domain.com/d/DB-id?var-pool=yt-e2e-pool-1&var-cluster=${CLUSTER}&var-tree=default"]`,
    );
});

test('Scheduling - Pool - Edit Dialog - Change Weight', async ({page}) => {
    await page.goto(makeClusterUrl('scheduling/overview?pool=yt-e2e-pool-1&tree=default'));
    const editBtn = await page.getByTitle('edit pool yt-e2e-pool-1');
    await editBtn.click();
    // pool edit dialog is open
    const dialogCaption = await page.waitForSelector('.df-dialog__caption');
    expect(await dialogCaption.innerText()).toBe('yt-e2e-pool-1');
    const weightInput = await page.waitForSelector('input[name="general.weight"]');
    const initialValue = await weightInput.inputValue();
    const newValue = '5' === initialValue ? '4' : '5';
    await weightInput.fill('');
    await weightInput.type(newValue);
    const confirmBtn = await page.getByText('Confirm');
    await confirmBtn.click();
    await page.waitForSelector(
        `td.scheduling-overview__table-item_type_weight :text("${newValue}")`,
    );
});
