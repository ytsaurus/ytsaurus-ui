import {type Page, expect, test} from '@playwright/test';
import {CLUSTER, CLUSTER_TITLE, makeClusterUrl} from '../../../utils';
import {basePage} from '../../../widgets/BasePage';
import type {QueryItem, QueryResult} from '../../../../src/ui/types/query-tracker/api';

const HISTORY_BODY = '.qp-query-history .qp-queries-list__body';

const completedQuery: QueryItem = {
    id: '1-1-1-1',
    engine: 'yql' as QueryItem['engine'],
    supportedEngines: {yql: true, chyt: false, spyt: false, ql: false},
    query: 'SELECT "London" AS city, 42 AS requests\nUNION ALL\nSELECT "Paris" AS city, 17 AS requests;',
    annotations: {title: 'Requests by city'},
    settings: {cluster: CLUSTER},
    files: [],
    secrets: [],
    access_control_objects: ['everyone'],
    user: 'screenshot-user',
    state: 'completed' as QueryItem['state'],
    start_time: '2025-11-30T12:00:00.000000Z',
    finish_time: '2025-11-30T12:00:02.000000Z',
    result_count: 1,
};

const failedQuery: QueryItem = {
    ...completedQuery,
    id: '2-2-2-2',
    annotations: {title: 'Unknown column'},
    query: 'SELECT missing_column FROM "//home/example/events";',
    state: 'failed' as QueryItem['state'],
    result_count: 0,
    start_time: '2025-11-30T11:00:00.000000Z',
    finish_time: '2025-11-30T11:00:01.000000Z',
    error: {
        code: 1,
        message: 'Query execution failed',
        attributes: {},
        inner_errors: [
            {
                code: 1,
                message: 'Column missing_column is not available in the input table schema',
                attributes: {start_position: {row: 1, column: 8}},
            },
        ],
    },
};

const resultMeta = {
    id: completedQuery.id,
    result_index: 0,
    schema: {
        $attributes: {strict: true, unique_keys: false},
        $value: [
            {name: 'city', type: 'string', type_v3: 'string', required: true},
            {name: 'requests', type: 'int64', type_v3: 'int64', required: true},
        ],
    },
    is_truncated: false,
    data_statistics: {row_count: 2, data_weight: 27},
};

const resultRows: QueryResult = {
    all_column_names: ['city', 'requests'],
    incomplete_all_column_names: false,
    incomplete_columns: false,
    yql_type_registry: [
        ['DataType', 'String'],
        ['DataType', 'Int64'],
    ],
    rows: [
        {city: ['London', '0'], requests: ['42', '1']},
        {city: ['Paris', '0'], requests: ['17', '1']},
    ],
};

async function mockQueries(page: Page) {
    const queries = [completedQuery, failedQuery];
    await page.route('**/api/yt/*/api/**', async (route) => {
        const request = route.request();
        const command = new URL(request.url()).pathname.split('/').pop();
        if (command === 'list_queries') {
            await route.fulfill({json: {queries, incomplete: false, timestamp: 1}});
            return;
        }
        if (command === 'get_query') {
            const {query_id: id} = request.postDataJSON();
            const query = queries.find((item) => item.id === id);
            expect(query, `Unexpected query id: ${id}`).toBeDefined();
            await route.fulfill({json: query});
            return;
        }
        if (command === 'get_query_result') {
            await route.fulfill({json: resultMeta});
            return;
        }
        if (command === 'read_query_result') {
            await route.fulfill({json: resultRows});
            return;
        }
        if (command === 'execute_batch') {
            const {requests} = request.postDataJSON() as {
                requests: {command: string; parameters: {query_id?: string}}[];
            };
            if (requests.every((item) => item.command === 'get_query_result')) {
                await route.fulfill({json: {results: requests.map(() => ({output: resultMeta}))}});
                return;
            }
        }
        await route.continue();
    });

    // Loading a saved query also saves the last selected engine/cluster.
    // Keep these writes local to the test, including with remote user settings.
    await page.route('**/api/settings/**', async (route) => {
        if (route.request().method() === 'GET') {
            await route.continue();
            return;
        }
        await route.fulfill({json: {}});
    });
}

async function openQueries(page: Page, queryId?: string) {
    await page.goto(makeClusterUrl(queryId ? `queries/${queryId}` : 'queries'));
    await expect(page.getByTestId('queries-page')).toBeVisible();
    // Monaco has no public QA locator. Its rendered lines signal editor readiness.
    await expect(page.locator('.monaco-editor .view-lines')).toBeVisible();
    const history = page.locator(HISTORY_BODY);
    await expect(history.getByText('Requests by city', {exact: true})).toBeVisible();
    await expect(history.getByText('Unknown column', {exact: true})).toBeVisible();
    await expect(page.locator('.yt-queries-page__loading')).toHaveCount(0);
    // Monaco fades scrollbars and blinks its cursor independently of page readiness.
    await page.addStyleTag({
        content: `
            .monaco-editor .cursor,
            .monaco-editor .scrollbar > .slider {
                visibility: hidden !important;
            }
        `,
    });
    await page.mouse.move(0, 0);
}

test.beforeEach(async ({page}) => {
    test.slow();
    await basePage(page).override_window__DATA__(
        {},
        {
            'global::queryTracker::useNewQueriesView': true,
            'global::queryTracker::queriesListSidebarVisibilityMode': true,
        },
    );
    await mockQueries(page);
});

test('Queries: new view', async ({page}) => {
    await openQueries(page);
    await expect(page).toHaveScreenshot();
});

test('Queries: new view with results', async ({page}) => {
    await openQueries(page, completedQuery.id);
    await expect(page.getByRole('tab', {name: 'Result', exact: true})).toHaveAttribute(
        'aria-selected',
        'true',
    );
    const result = page.getByRole('tabpanel', {name: 'Result', exact: true});
    await expect(result.getByText('"London"', {exact: true})).toBeVisible();
    await expect(result.getByText('"Paris"', {exact: true})).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Queries: new view with error', async ({page}) => {
    await openQueries(page, failedQuery.id);
    await expect(page.getByText('Query execution failed', {exact: true})).toBeVisible();
    await expect(
        page.getByText('Column missing_column is not available in the input table schema', {
            exact: true,
        }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot();
});

test('Queries: new view with navigation', async ({page}) => {
    await openQueries(page);
    await page.getByRole('tab', {name: 'Navigation', exact: true}).click();
    const navigation = page.getByRole('tabpanel', {name: 'Navigation', exact: true});
    await expect(navigation).toBeVisible();
    await expect(
        navigation.getByText(CLUSTER_TITLE || String(CLUSTER), {exact: true}),
    ).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot();
});
