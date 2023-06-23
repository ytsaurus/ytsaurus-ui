import {test, expect} from '@playwright/test';
import {E2E_DIR, makeClusterTille, makeClusterUrl} from '../utils';

test('Navigation - Content', async ({page}) => {
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

test('Navigation - Attributes', async ({page}) => {
    await page.goto(makeClusterUrl('navigation?navmode=attributes'));

    await page.waitForSelector(':text("attribute_revision")');

    await page.fill('.structured-yson-virtualized__filter input', 'account');
    await page.waitForSelector('.structured-yson-virtualized__filtered_highlighted');
    const highLightedText = await page.$eval(
        '.structured-yson-virtualized__filtered_highlighted',
        (node) => node.textContent,
    );
    expect(highLightedText).toBe('account');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?navmode=attributes&path=/'));
});

test('Navigation - User attirbutes', async ({page}) => {
    await page.goto(makeClusterUrl('navigation?navmode=user_attributes'));
    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?navmode=user_attributes&path=/'));

    await page.waitForSelector(':text("hello_world")');
});

test('Navigation - ACL', async ({page}) => {
    await page.goto(makeClusterUrl('navigation?navmode=acl'));

    await page.waitForSelector(':text("write, administer, remove, mount")');

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?navmode=acl&path=/'));
});

test('Navigation - Locks', async ({page}) => {
    await page.goto(makeClusterUrl(`navigation?navmode=locks&path=${E2E_DIR}/locked`));

    await page.waitForSelector('[data-qa="lock-meta-table"]');
    let length = await page.$$eval('[data-qa="lock-meta-table"]', (nodes) => nodes.length);

    expect(length).toBe(2);

    await page.click('[data-qa="locks-type-filter"] [value="shared"]');
    await page.waitForTimeout(50);
    length = await page.$$eval('[data-qa="lock-meta-table"]', (nodes) => nodes.length);
    expect(length).toBe(1);

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: 'locked'}));
    await expect(page).toHaveURL(makeClusterUrl(`navigation?navmode=locks&path=${E2E_DIR}/locked`));
});
