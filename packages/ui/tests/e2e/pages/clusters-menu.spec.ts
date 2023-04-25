import {test, expect} from '@playwright/test';
import {CLUSTER_TITLE, makeClusterTille, makeClusterUrl, makeUrl} from '../utils';

test('ClustersMenu', async ({page}) => {
    await page.goto(makeUrl());

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Clusters');

    await page.click(`.cluster-menu__item-heading:text("${CLUSTER_TITLE?.toUpperCase()}")`);

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?path=/')); // checks default users settings, Navigation is default start page
});
