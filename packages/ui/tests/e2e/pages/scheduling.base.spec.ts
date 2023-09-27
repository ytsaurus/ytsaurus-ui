import {expect, test} from '@playwright/test';
import {CLUSTER, makeClusterTille, makeClusterUrl} from '../utils';
import page from '../../../src/ui/store/reducers/operations/page';

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

test('Scheduling: Should display pools from Navigation', async ({page}) => {
    await page.goto(makeClusterUrl('navigation?path=//sys/pool_trees'));
    await page.click('.elements-table__row :text("default")');
    await page.click('.elements-table__row :text("yt-e2e-pool-1")');

    await page.waitForSelector(':text("No items to show")');

    await expect(page).toHaveTitle(makeClusterTille({path: 'yt-e2e-pool-1', page: 'Navigation'}));
    await expect(page).toHaveURL(
        makeClusterUrl('navigation?path=//sys/pool_trees/default/yt-e2e-pool-1'),
    );
});

test('Scheduling: Should display ephemeral pool for empty pool tree', async ({page}) => {
    await page.goto(makeClusterUrl('scheduling?tree=e2e'));

    await page.waitForSelector('text="test-e2e"');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Scheduling'}));
    await expect(page).toHaveURL(makeClusterUrl('scheduling/overview?tree=e2e'));

    const operationLinkSelector = `.scheduling-overview__name-content-name [href^="/${CLUSTER}/operations/"]`;
    const length = await page.$$eval(operationLinkSelector, (nodes) => nodes.length);
    expect(length).toBe(0);

    await page.click('.scheduling-overview__table-row-expander');
    await page.waitForSelector(operationLinkSelector);
});
