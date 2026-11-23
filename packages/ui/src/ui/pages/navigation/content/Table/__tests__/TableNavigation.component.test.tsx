import React from 'react';
import {type Page} from '@playwright/test';
import {type Store, type UnknownAction} from 'redux';
import {type History} from 'history';

import {CLEAR_TRANSACTION, SET_TRANSACTION, UPDATE_PATH} from '../../../../../constants/navigation';
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

test('Navigation table: ignores a source read completing after the destination schema', async ({
    mount,
    page,
}) => {
    let deliver!: () => void;
    const pending = new Promise<void>((resolve) => {
        deliver = resolve;
    });
    let notifyRequest!: () => void;
    const started = new Promise<void>((resolve) => {
        notifyRequest = resolve;
    });
    await page.route(/\/api\/v[34]\/select_rows(?:\?.*)?$/, async (route) => {
        notifyRequest();
        await pending;
        await route.fulfill({json: sourceResponse('late-source-value')});
    });
    await mountTable(mount, page);
    await page.getByRole('button', {name: 'Refresh', exact: true}).click();
    await started;
    await page.getByRole('button', {name: 'Open empty table', exact: true}).click();
    await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
    deliver();
    await expect(page.getByText('Completed reads: 1', {exact: true})).toBeVisible();
    expect(await tableState(page)).toMatchObject({
        loaded: true,
        loading: false,
        rows: [],
        yqlTypes: [],
        columns: ['destination_key'],
    });
});

test('Navigation table: ignores columns from an obsolete preload', async ({mount, page}) => {
    let deliver!: () => void;
    const pending = new Promise<void>((resolve) => {
        deliver = resolve;
    });
    let notifyRequest!: () => void;
    const started = new Promise<void>((resolve) => {
        notifyRequest = resolve;
    });
    let reads = 0;
    await page.route(/\/api\/v[34]\/check_permission(?:\?.*)?$/, async (route) => {
        await route.fulfill({json: {action: 'allow', columns: [{action: 'allow'}]}});
    });
    await page.route(/\/api\/v[34]\/select_rows(?:\?.*)?$/, async (route) => {
        reads++;
        if (reads === 1) {
            notifyRequest();
            await pending;
            await route.fulfill({
                json: {rows: [], all_column_names: ['source_key']},
            });
        } else {
            await route.fulfill({
                json: {rows: [], all_column_names: ['destination_key'], yql_type_registry: []},
            });
        }
    });
    await mountTable(mount, page);
    await page.getByRole('button', {name: 'Load table', exact: true}).click();
    await started;
    await page.getByRole('button', {name: 'Open empty table', exact: true}).click();
    await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
    deliver();
    await expect(page.getByText('Completed reads: 1', {exact: true})).toBeVisible();
    expect(reads).toBe(1);
    expect(await tableState(page)).toMatchObject({
        loaded: true,
        loading: false,
        rows: [],
        yqlTypes: [],
        columns: ['destination_key'],
    });
});
