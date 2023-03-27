import {test, expect} from '@playwright/test';
import {makeClusterTille, makeClusterUrl, makeUrl} from '../utils';

test('ClustersMenu', async ({page}) => {
    await page.goto(makeUrl());

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Clusters');

    await page.click('.cluster-menu__item');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?path=/'));
});

test('Navigation', async ({page}) => {
    await page.goto(makeClusterUrl('navigation'));

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?path=/'));

    await page.click('text="sys"');

    await expect(page).toHaveTitle(makeClusterTille({path: 'sys', page: 'Navigation'}));

    await page.fill('input[placeholder="Filter..."]', 'users');

    await page.waitForSelector('text="users"');

    const rowCount = await page.$eval('.map-node__content tbody', (node) => node.childElementCount);
    expect(rowCount).toBe(1);
});
