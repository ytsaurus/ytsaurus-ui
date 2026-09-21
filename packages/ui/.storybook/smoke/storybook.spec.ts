import {type Page, expect, test} from '@playwright/test';

const trackRuntimeErrors = (page: Page) => {
    const pageErrors = new Array<Error>();
    const failedResponses = new Array<string>();

    page.on('pageerror', (error) => pageErrors.push(error));
    page.on('response', (response) => {
        if (response.status() >= 400) {
            failedResponses.push(`${response.status()} ${response.url()}`);
        }
    });

    return () => {
        expect(pageErrors.map((error) => error.message)).toEqual([]);
        expect(failedResponses).toEqual([]);
    };
};

test('renders the production preview and loads its fonts', async ({page}) => {
    const assertNoRuntimeErrors = trackRuntimeErrors(page);
    const fontResponse = page.waitForResponse((response) =>
        response.url().includes('/assets/fonts/Manrope-Regular.'),
    );

    await page.goto(
        'iframe.html?id=components-statuslabel--all-status-label-states&viewMode=story',
    );

    await expect(page.getByText('StatusLabelState variants:', {exact: true})).toBeVisible();
    expect((await fontResponse).ok()).toBe(true);
    assertNoRuntimeErrors();
});

test('renders BundleEditorDialog with its mocked accounts request', async ({page}) => {
    const assertNoRuntimeErrors = trackRuntimeErrors(page);
    const accountsResponse = page.waitForResponse((response) =>
        response.url().endsWith('/api/v3/list'),
    );

    await page.goto(
        'iframe.html?id=pages-tablet-cell-bundles-bundleeditordialog--default&viewMode=story',
    );

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('production_bundle', {exact: true})).toBeVisible();
    expect((await accountsResponse).ok()).toBe(true);
    assertNoRuntimeErrors();
});

test('renders BundleTableField at a representative width', async ({page}) => {
    const assertNoRuntimeErrors = trackRuntimeErrors(page);

    await page.goto(
        'iframe.html?id=pages-tablet-cell-bundles-bundletablefield--normal-selected&viewMode=story',
    );

    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    expect(
        await table.evaluate((element) => element.getBoundingClientRect().width),
    ).toBeGreaterThan(900);
    await expect(page.getByText('Normal configuration', {exact: true})).toBeVisible();
    assertNoRuntimeErrors();
});
