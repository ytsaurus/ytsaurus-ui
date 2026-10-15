import {type Page, expect, test} from '@playwright/test';
import {E2E_DIR, makeClusterUrl} from '../../utils';
import {setUserSettings} from '../../utils/settings';

type TestWindow = Window & {store: {dispatch: (action: {type: string; data: unknown}) => void}};

const flag = 'global::queryTracker::useNewQueriesView';

const openQueries = async (page: Page, modern: boolean) => {
    await page.goto(makeClusterUrl('queries'));
    await expect(page.locator('.monaco-editor').first()).toBeVisible();
    await setUserSettings(page, flag, modern);
    await expect(page.getByTestId('queries-page')).toHaveCount(modern ? 1 : 0);
    await expect(page.locator('.cluster-page-header')).toHaveCount(modern ? 0 : 1);
    await expect(page.locator('.monaco-editor').first()).toBeVisible();
};

const replaceText = async (page: Page, value: string) => {
    await page.locator('.monaco-editor').first().click();
    await page.keyboard.press('ControlOrMeta+KeyA');
    await page.keyboard.insertText(value);
};

const queryText = (page: Page) => page.locator('.monaco-editor').first().locator('.view-lines');
const newQuery = (page: Page, modern: boolean) =>
    modern
        ? page.getByRole('button', {name: 'New query', exact: true})
        : page.getByTestId('new-query-btn');

[false, true].forEach((modern) => {
    test.describe(`@QueryPage ${modern ? 'querieskit' : 'legacy'}`, () => {
        test('new query protects unsaved text and resets the workspace', async ({page}) => {
            await openQueries(page, modern);
            await replaceText(page, 'SELECT 101');
            await newQuery(page, modern).click();
            await expect(page.getByTestId('modal-confirm')).toBeVisible();
            await page.getByRole('button', {name: 'Cancel', exact: true}).click();
            await expect(queryText(page)).toContainText('101');
            await newQuery(page, modern).click();
            await page.getByTestId('modal-confirm').click();
            await expect(queryText(page)).not.toContainText('101');
            await expect(page).toHaveURL(/\/queries\/?$/);
        });

        test('runs a query, shows results and restores it with browser navigation', async ({
            page,
        }) => {
            test.setTimeout(90_000);
            await openQueries(page, modern);
            // Select the engine independently of a developer's remembered preference.
            await page.evaluate(() =>
                (window as TestWindow).store.dispatch({
                    type: 'query-tracker/SET_QUERY_PATCH',
                    data: {engine: 'yql'},
                }),
            );
            await replaceText(page, 'SELECT 424242 AS value');
            const run = modern
                ? page.getByRole('button', {name: 'Run', exact: true})
                : page.getByTestId('qt-run');
            await run.click();
            await expect(page).toHaveURL(/\/queries\/[^/?]+/);
            await expect(page.getByRole('cell', {name: '424242', exact: true})).toBeVisible({
                timeout: 60_000,
            });
            const url = page.url();
            await newQuery(page, modern).click();
            await expect(page).toHaveURL(/\/queries\/?$/);
            await page.goBack();
            await expect(page).toHaveURL(url);
            await expect(queryText(page)).toContainText('424242');
            await page.goForward();
            await expect(page).toHaveURL(/\/queries\/?$/);
        });

        test('stops the active execution', async ({page}) => {
            await openQueries(page, modern);
            let aborted = false;
            const query = {
                id: '11111111-22222222-33333333-44444444',
                engine: 'yql',
                query: 'SELECT 1',
                files: [],
                secrets: [],
                settings: {},
                annotations: {},
                result_count: 0,
                user: 'query-page-test',
                start_time: '2026-01-01T10:00:00Z',
                progress: {},
                state: 'running',
                access_control_objects: ['everyone-share'],
            };
            // Keep the execution running deterministically; never abort a real user's query.
            await page.route(/\/abort_query(?:\?|$)/, async (route) => {
                aborted = true;
                await route.fulfill({json: {}});
            });
            await page.route(/\/get_query(?:\?|$)/, (route) =>
                route.fulfill({
                    json: {...query, state: aborted ? 'aborted' : 'running'},
                }),
            );
            await page.evaluate((initialQuery) => {
                (window as TestWindow).store.dispatch({
                    type: 'query-tracker/SET_QUERY',
                    data: {initialQuery},
                });
            }, query);
            await page.getByRole('button', {name: 'Stop', exact: true}).click();
            await expect.poll(() => aborted).toBe(true);
            await expect(page.getByRole('button', {name: 'Stop', exact: true})).toBeHidden();
        });

        test('keeps the table QueryWidget on the legacy interface', async ({page}) => {
            await openQueries(page, modern);
            await page.goto(
                makeClusterUrl(`navigation?navmode=content&path=${E2E_DIR}/static-table`),
            );
            await setUserSettings(page, flag, modern);
            await expect(page.locator('.cluster-page-header')).toBeVisible();
            await page.getByTitle('Open Queries widget').click();
            await expect(page.getByTestId('qt-run')).toBeVisible();
            await expect(page.getByTestId('new-query-btn')).toBeVisible();
            await expect(page.getByTestId('queries-page')).toHaveCount(0);
        });
    });
});

test('@QueryPage flag switching preserves the current draft', async ({page}) => {
    await openQueries(page, false);
    await replaceText(page, 'SELECT 101');
    for (const enabled of [true, false, true]) {
        await setUserSettings(page, flag, enabled);
        await expect(queryText(page)).toContainText('101');
    }
    await expect(page.getByRole('button', {name: 'Parameters', exact: true})).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Format', exact: true})).toHaveCount(0);
});

test('@QueryPage file editor preserves the main editor model and undo history', async ({page}) => {
    await openQueries(page, true);
    await replaceText(page, 'SELECT 1');
    await page.keyboard.press('End');
    await page.keyboard.insertText(' + 2');
    const mainEditor = await page.locator('.monaco-editor').first().elementHandle();
    if (!mainEditor) throw new Error('Query editor is missing');
    await page.getByRole('button', {name: 'Attachments', exact: true}).click();
    await page.getByRole('button', {name: 'New file', exact: true}).click();
    await page.getByTestId('query-file-name').locator('input').fill('example.txt');
    await page.getByTestId('query-file-name').locator('input').press('Enter');
    await page.getByTestId('query-file-edit-content').click();
    const file = page.getByTestId('query-file-editor');
    await file.locator('.monaco-editor').click();
    await page.keyboard.insertText('file contents');
    await page.getByTestId('query-file-toggle-width').click();
    await expect(page.locator('.yt-queries-page__query-content')).toBeHidden();
    await page.getByTestId('query-file-toggle-width').click();
    await page.getByTestId('query-file-close').click();
    expect(await mainEditor.evaluate((element) => element.isConnected)).toBe(true);
    await expect(queryText(page)).toContainText('1 + 2');
    await page.locator('.monaco-editor').first().click();
    await page.keyboard.press('ControlOrMeta+KeyZ');
    await expect(queryText(page)).not.toContainText('+ 2');
    await page.keyboard.press('ControlOrMeta+Shift+KeyZ');
    await expect(queryText(page)).toContainText('1 + 2');
    await page.getByTestId('query-file-edit-content').click();
    await expect(file.locator('.view-lines')).toContainText('file contents');
});

test('@QueryPage run shortcut submits once and respects loading', async ({page}) => {
    await openQueries(page, true);
    let requests = 0;
    await page.route(/\/start_query(?:\?|$)/, async (route) => {
        requests += 1;
        await route.fulfill({status: 500, json: {message: 'Controlled test failure', code: 1}});
    });
    await replaceText(page, 'SELECT 1');
    await page.keyboard.press('ControlOrMeta+Enter');
    await expect.poll(() => requests).toBe(1);
    await expect(page.getByRole('button', {name: 'Run', exact: true})).toBeEnabled();
    await page.evaluate(() =>
        (window as TestWindow).store.dispatch({
            type: 'query-tracker/REQUEST_QUERY',
            data: undefined,
        }),
    );
    await expect(page.getByRole('button', {name: 'Run', exact: true})).toBeDisabled();
    await page.keyboard.press('F8');
    expect(requests).toBe(1);
});
