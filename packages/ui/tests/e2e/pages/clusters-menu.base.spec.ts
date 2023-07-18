import {expect, test} from '@playwright/test';
import {
    CLUSTERS_MENU_EXPECT,
    CLUSTER_TITLE,
    makeClusterTille,
    makeClusterUrl,
    makeUrl,
} from '../utils';

test('ClustersMenu', async ({page}) => {
    await page.goto(makeUrl());

    const [expectPath = 'navigation?path=/', expectTitle = 'Navigation', expectTitlePath = '/'] = (
        CLUSTERS_MENU_EXPECT || 'navigation?path=/'
    ).split(';');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Clusters');

    await page.click(`.cluster-menu__item-heading:text("${CLUSTER_TITLE?.toUpperCase()}")`);

    await expect(page).toHaveTitle(makeClusterTille({page: expectTitle, path: expectTitlePath}));
    await expect(page).toHaveURL(makeClusterUrl(expectPath)); // checks default users settings, Navigation is default start page
});
