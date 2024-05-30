import {expect, test} from '@playwright/test';
import {CLUSTER, E2E_DIR, makeClusterTille, makeClusterUrl} from '../utils';

test('Navigation - Content', async ({page}) => {
    await page.goto(makeClusterUrl('navigation'));

    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?path=/'));

    await page.click('text="sys"');

    await expect(page).toHaveTitle(makeClusterTille({path: 'sys', page: 'Navigation'}));

    await page.fill('input[placeholder="Filter..."]', 'users');

    await page.waitForSelector('.map-node__content tbody tr:first-child :text("users")');

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

test('Navigation - User attributes', async ({page}) => {
    await page.goto(makeClusterUrl('navigation?navmode=user_attributes'));
    await expect(page).toHaveTitle(makeClusterTille({page: 'Navigation', path: '/'}));
    await expect(page).toHaveURL(makeClusterUrl('navigation?navmode=user_attributes&path=/'));

    await page.waitForSelector(':text("hello_world")');
});

test('Navigation - ACL', async ({page}) => {
    await page.goto(makeClusterUrl('navigation?navmode=acl'));

    await page.waitForSelector(`:text('"Write", "Administer", "Remove", "Mount"')`);

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

test('Navigation - URL correct encoding', async ({page}) => {
    test.slow();
    await test.step('escaped-symbol', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/escaped-symbol%0A"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('trailing-space', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/trailing-space%20"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step("<script>alert('hello XSS!')</script>", async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/%3Cscript%3Ealert('hello%20XSS!')%3C%5C/script%3E"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('<script>console.error("hello XSS")</script>', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/%3Cscript%3Econsole.error(%22hello%20XSS%22)%3C%5C/script%3E"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('_TAB_TAB', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/_%09_%09"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('_NEWLINE_NEWLINE', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/_%10_%10"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('Компоненты для Paysup.json', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82%D1%8B%20%D0%B4%D0%BB%D1%8F%20Paysup.json"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('Компоненты для Paysup.json ENCODED', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/%C3%90%C2%9A%C3%90%C2%BE%C3%90%C2%BC%C3%90%C2%BF%C3%90%C2%BE%C3%90%C2%BD%C3%90%C2%B5%C3%90%C2%BD%C3%91%C2%82%C3%91%C2%8B%20%C3%90%C2%B4%C3%90%C2%BB%C3%91%C2%8F%20Paysup.json"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('__SLASH', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/__%5C/"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });

    await test.step('__@', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/__%5C@"]`,
        );
        await link.click();
        await page.waitForSelector(':text("ok")');
    });
});

test('Navigation - escaped symbols are highlighted and cyrillic', async ({page}) => {
    test.slow();

    await test.step('escaped-symbol\\n', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/escaped-symbol%0A"]`,
        );
        expect(await link.innerText()).toEqual('escaped-symbol\\n');
    });
    await test.step('trailing-space', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/trailing-space%20"]`,
        );
        expect(await link.innerText()).toEqual('trailing-space ');
    });
    await test.step('cyrillic', async () => {
        await page.goto(makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/bad-names`));
        const link = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82%D1%8B%20%D0%B4%D0%BB%D1%8F%20Paysup.json"]`,
        );
        expect(await link.innerText()).toEqual('Компоненты для Paysup.json');
        await link.click();
        const breadcrumbLink = await page.waitForSelector(
            `[href="/${CLUSTER}/navigation?path=${E2E_DIR}/bad-names/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82%D1%8B%20%D0%B4%D0%BB%D1%8F%20Paysup.json&navmode=content&filter="]`,
        );
        expect(await breadcrumbLink.innerText()).toEqual('Компоненты для Paysup.json');
    });
});
