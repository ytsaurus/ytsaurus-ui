import {expect, test} from '@playwright/test';
import {CLUSTER_TITLE, MOCK_DATE, makeUrl} from '../../../utils';
import {replaceInnerHtml} from '../../../utils/dom';

test('ClustersMenu', async ({page}) => {
    await page.clock.install({time: MOCK_DATE});
    await page.goto(makeUrl());

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('Clusters');

    await page.waitForSelector(
        `.cluster-menu__item-heading:text("${CLUSTER_TITLE?.toUpperCase()}")`,
    );

    await replaceInnerHtml(page, {'.cluster-menu__item-version': '12.34.56'});
    await expect(page).toHaveScreenshot();
});
