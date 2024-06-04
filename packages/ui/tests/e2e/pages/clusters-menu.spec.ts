import {expect, test} from '@playwright/test';
import {
    CLUSTERS_MENU_EXPECT,
    CLUSTER_TITLE,
    makeClusterTille,
    makeClusterUrl,
    makeUrl,
} from '../../utils';

test('ClustersMenu: icons', async ({page}) => {
    await page.goto(makeUrl());

    const [expectPath = 'navigation?path=/', expectTitle = 'Navigation', expectTitlePath = '/'] = (
        CLUSTERS_MENU_EXPECT || 'navigation?path=/'
    ).split(';');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Clusters');

    await test.step('imagebig', async () => {
        const el = await page.waitForSelector(
            '.cluster-menu__item-image.cluster-color_theme_grapefruit',
        );
        const style = await el.getAttribute('style');
        expect(style).toBe(
            'background-image: url("https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-big.44e3fa56.jpg");',
        );
    });

    await test.step('clickable cluster', async () => {
        await page.click(`.cluster-menu__item-heading:text("${CLUSTER_TITLE?.toUpperCase()}")`);

        await expect(page).toHaveTitle(
            makeClusterTille({page: expectTitle, path: expectTitlePath}),
        );
        await expect(page).toHaveURL(makeClusterUrl(expectPath)); // checks default users settings, Navigation is default start page
    });

    await test.step('image2x', async () => {
        await page.waitForSelector(
            '.cluster-icon__wrapper img[src="https://yastatic.net/s3/cloud/yt/static/freeze/assets/images/ui-2x.38d49f78.jpg"]',
        );
    });
});
