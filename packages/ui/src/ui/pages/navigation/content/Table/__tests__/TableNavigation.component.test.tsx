import React from 'react';
import {type Page} from '@playwright/test';
import {type Store, type UnknownAction} from 'redux';
import {type History} from 'history';

import {
    CLEAR_TRANSACTION,
    SET_TRANSACTION,
    UPDATE_PATH,
    UPDATE_VIEW,
} from '../../../../../constants/navigation';
import {SET_COLUMNS} from '../../../../../constants/navigation/content/table';
import {RESET_STORE_BEFORE_CLUSTER_CHANGE} from '../../../../../constants/utils';
import {expect, test} from '../../../../../playwright-components/core';
import {type MountFixture} from '../../../../../playwright-components/core/types';
import {type RootState} from '../../../../../store/reducers';
import {TableNavigationStories} from '../__stories__';

type FixtureWindow = Window & {store: Store<RootState>; appBrowserHistory: History};
const sourcePath = '//home/source';
const destinationPath = '//home/empty';

async function mountTable(mount: MountFixture, page: Page) {
    await page.route(/\/hosts(?:\?.*)?$/, async (route) => {
        await route.fulfill({json: [new URL(route.request().url()).host]});
    });
    await mount(<TableNavigationStories.EmptyTable />);
    await expect(page.getByRole('region', {name: 'Table preview'})).toContainText('source-value');
}

function sourceResponse(value: string) {
    return {
        rows: [{source_key: [[value], 0]}],
        all_column_names: ['source_key'],
        yql_type_registry: [['OptionalType', ['DataType', 'String']]],
    };
}

async function navigate(page: Page, path: string, params: Record<string, string> = {}) {
    await page.evaluate(
        ({path: nextPath, params: nextParams}) => {
            (window as unknown as FixtureWindow).appBrowserHistory.push(
                '/Cluster/navigation?' + new URLSearchParams({path: nextPath, ...nextParams}),
            );
        },
        {path, params},
    );
}

function tableState(page: Page) {
    return page.evaluate(() => {
        const state = (window as unknown as FixtureWindow).store.getState();
        const error = state.navigation.content.table.errorData as {
            message?: string;
            stack?: string;
        };
        const {
            rows,
            columns,
            yqlTypes,
            loaded,
            loading,
            isDynamic,
            isStrict,
            pageSize,
            cellSize,
            offsetValue,
        } = state.navigation.content.table;
        return {
            path: state.navigation.navigation.path,
            transaction: state.navigation.navigation.transaction,
            rows,
            columns: columns.map((column) => column.name),
            yqlTypes,
            loaded,
            loading,
            isDynamic,
            isStrict,
            pageSize,
            cellSize,
            offsetValue,
            error: state.navigation.content.table.error,
            readError: error.message,
            readStack: error.stack,
        };
    });
}

test('Navigation table: clears old data before a new URL read and applies destination pagination', async ({
    mount,
    page,
}) => {
    await mountTable(mount, page);
    await expect(page.getByRole('region', {name: 'Table preview'})).toContainText('source-value');
    await navigate(page, destinationPath, {pageSize: '25', stringLimit: '100', offsetValue: '7'});
    expect(await tableState(page)).toMatchObject({
        path: destinationPath,
        rows: [],
        columns: [],
        yqlTypes: null,
        loaded: false,
        isDynamic: false,
        isStrict: false,
        pageSize: 25,
        cellSize: 100,
        offsetValue: '7',
    });
});

test('Navigation table: preserves loaded data during same-table pagination', async ({
    mount,
    page,
}) => {
    await mountTable(mount, page);
    const before = await tableState(page);
    await navigate(page, sourcePath, {pageSize: '50', offsetValue: '12'});
    expect(await tableState(page)).toMatchObject({
        rows: before.rows,
        columns: before.columns,
        yqlTypes: before.yqlTypes,
        loaded: true,
        pageSize: 50,
        offsetValue: '12',
    });
    await page.evaluate((action) => (window as unknown as FixtureWindow).store.dispatch(action), {
        type: UPDATE_PATH,
        data: {path: sourcePath, shouldUpdateContentMode: false},
    });
    expect(await tableState(page)).toMatchObject({
        rows: before.rows,
        columns: before.columns,
        yqlTypes: before.yqlTypes,
        loaded: true,
    });
});

test('Navigation table: clears rows when the transaction changes in the URL', async ({
    mount,
    page,
}) => {
    await mountTable(mount, page);
    await navigate(page, sourcePath, {t: 'transaction'});
    expect(await tableState(page)).toMatchObject({
        transaction: 'transaction',
        rows: [],
        columns: [],
        yqlTypes: null,
        loaded: false,
    });
});

for (const [name, action] of [
    ['path', {type: UPDATE_PATH, data: {path: destinationPath, shouldUpdateContentMode: false}}],
    ['set transaction', {type: SET_TRANSACTION, data: 'transaction'}],
    ['cluster', {type: RESET_STORE_BEFORE_CLUSTER_CHANGE, data: {shouldUsePreserveState: true}}],
] as const) {
    test(`Navigation table: clears loaded data on a store-originated change of ${name}`, async ({
        mount,
        page,
    }) => {
        await mountTable(mount, page);
        await navigate(page, sourcePath, {pageSize: '50'});
        await page.evaluate(
            (nextAction) => (window as unknown as FixtureWindow).store.dispatch(nextAction),
            action,
        );
        expect(await tableState(page)).toMatchObject({
            rows: [],
            columns: [],
            yqlTypes: null,
            loaded: false,
            pageSize: 50,
        });
    });
}

test('Navigation table: clears rows when a transaction is removed directly', async ({
    mount,
    page,
}) => {
    await mountTable(mount, page);
    await navigate(page, sourcePath, {t: 'transaction'});
    await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
    await page.evaluate(
        (action: UnknownAction) => (window as unknown as FixtureWindow).store.dispatch(action),
        {type: CLEAR_TRANSACTION},
    );
    expect(await tableState(page)).toMatchObject({
        transaction: undefined,
        rows: [],
        columns: [],
        yqlTypes: null,
        loaded: false,
    });
});

test('Navigation table: accepts a current source refresh', async ({mount, page}) => {
    await page.route(/\/api\/v[34]\/select_rows(?:\?.*)?$/, async (route) => {
        await route.fulfill({json: sourceResponse('fresh-source-value')});
    });
    await mountTable(mount, page);
    await page.getByRole('button', {name: 'Refresh', exact: true}).click();
    await expect(page.getByText('Completed reads: 1', {exact: true})).toBeVisible();
    const refreshed = await tableState(page);
    expect(refreshed, refreshed.readStack || refreshed.readError).toMatchObject({
        loaded: true,
        loading: false,
        error: false,
        rows: [{source_key: [['fresh-source-value'], 0]}],
        columns: ['source_key'],
    });
    await expect(page.getByRole('region', {name: 'Table preview'})).toContainText(
        'fresh-source-value',
    );
});

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
        resolve = done;
    });
    return {promise, resolve};
}

for (const outcome of ['success', 'error'] as const) {
    test(`Navigation table: ignores an obsolete read ${outcome}`, async ({mount, page}) => {
        const pending = deferred();
        const started = deferred();
        await page.route(/\/api\/v[34]\/select_rows(?:\?.*)?$/, async (route) => {
            started.resolve();
            await pending.promise;
            await route.fulfill(
                outcome === 'success'
                    ? {json: sourceResponse('late-source-value')}
                    : {status: 400, json: {code: 1, message: 'late-source-error'}},
            );
        });
        await mountTable(mount, page);
        await page.getByRole('button', {name: 'Refresh', exact: true}).click();
        await started.promise;
        await page.getByRole('button', {name: 'Open empty table', exact: true}).click();
        await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
        pending.resolve();
        await expect(page.getByText('Completed reads: 1', {exact: true})).toBeVisible();
        const state = await tableState(page);
        expect(state).toMatchObject({
            loaded: true,
            loading: false,
            rows: [],
            yqlTypes: [],
            columns: ['destination_key'],
        });
        expect(state.error).toBeFalsy();
        expect(state.readError).toBeFalsy();
    });

    test(`Navigation table: ignores an obsolete preload ${outcome}`, async ({mount, page}) => {
        const pending = deferred();
        const started = deferred();
        let reads = 0;
        await page.route(/\/api\/v[34]\/check_permission(?:\?.*)?$/, async (route) => {
            await route.fulfill({json: {action: 'allow', columns: [{action: 'allow'}]}});
        });
        await page.route(/\/api\/v[34]\/select_rows(?:\?.*)?$/, async (route) => {
            reads++;
            if (reads === 1) {
                started.resolve();
                await pending.promise;
                await route.fulfill(
                    outcome === 'success'
                        ? {json: {rows: [], all_column_names: ['source_key']}}
                        : {status: 400, json: {code: 1, message: 'late-preload-error'}},
                );
            } else {
                await route.fulfill({
                    json: {rows: [], all_column_names: ['destination_key'], yql_type_registry: []},
                });
            }
        });
        await mountTable(mount, page);
        await page.getByRole('button', {name: 'Load table', exact: true}).click();
        await started.promise;
        await page.getByRole('button', {name: 'Open empty table', exact: true}).click();
        await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
        pending.resolve();
        await expect(page.getByText('Completed reads: 1', {exact: true})).toBeVisible();
        expect(reads).toBe(1);
        const state = await tableState(page);
        expect(state).toMatchObject({
            loaded: true,
            loading: false,
            rows: [],
            yqlTypes: [],
            columns: ['destination_key'],
        });
        expect(state.error).toBeFalsy();
        expect(state.readError).toBeFalsy();
    });
}

test('Navigation table: keeps the new read active after returning to the same path', async ({
    mount,
    page,
}) => {
    const obsoletePending = deferred();
    const obsoleteStarted = deferred();
    const obsoleteDelivered = deferred();
    const currentPending = deferred();
    const currentStarted = deferred();
    let reads = 0;
    await page.route(/\/api\/v[34]\/check_permission(?:\?.*)?$/, async (route) => {
        await route.fulfill({json: {action: 'allow', columns: [{action: 'allow'}]}});
    });
    await page.route(/\/api\/v[34]\/select_rows(?:\?.*)?$/, async (route) => {
        reads++;
        if (reads === 1) {
            obsoleteStarted.resolve();
            await obsoletePending.promise;
            await route.fulfill({json: {rows: [], all_column_names: ['obsolete_key']}});
            obsoleteDelivered.resolve();
        } else {
            currentStarted.resolve();
            await currentPending.promise;
            await route.fulfill({json: sourceResponse('current-source-value')});
        }
    });
    await mountTable(mount, page);
    await page.getByRole('button', {name: 'Load table', exact: true}).click();
    await obsoleteStarted.promise;
    await page.getByRole('button', {name: 'Open empty table', exact: true}).click();
    await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
    await navigate(page, sourcePath);
    await page.evaluate(
        ({updateViewType, setColumnsType}) => {
            const {store} = window as unknown as FixtureWindow;
            store.dispatch({
                type: updateViewType,
                data: {
                    attributes: {
                        dynamic: true,
                        sorted: true,
                        key_columns: ['source_key'],
                        schema: {
                            $value: [{name: 'source_key', type: 'string', sort_order: 'ascending'}],
                            $attributes: {strict: true},
                        },
                    },
                },
            });
            store.dispatch({
                type: setColumnsType,
                data: {
                    columns: [{name: 'source_key', checked: true, keyColumn: true}],
                    omittedColumns: [],
                    deniedKeyColumns: [],
                },
            });
        },
        {updateViewType: UPDATE_VIEW.SUCCESS, setColumnsType: SET_COLUMNS},
    );
    await page.getByRole('button', {name: 'Refresh', exact: true}).click();
    await currentStarted.promise;
    await expect(page.getByText('Completed reads: 1', {exact: true})).toBeVisible();
    expect(reads).toBe(2);
    expect(await tableState(page)).toMatchObject({
        path: sourcePath,
        loaded: false,
        loading: true,
        rows: [],
        columns: ['source_key'],
    });
    obsoletePending.resolve();
    await obsoleteDelivered.promise;
    expect(reads).toBe(2);
    expect(await tableState(page)).toMatchObject({loaded: false, loading: true});
    currentPending.resolve();
    await expect(page.getByText('Completed reads: 2', {exact: true})).toBeVisible();
    expect(reads).toBe(2);
    expect(await tableState(page)).toMatchObject({
        path: sourcePath,
        loaded: true,
        loading: false,
        rows: sourceResponse('current-source-value').rows,
        columns: ['source_key'],
    });
});
