import React from 'react';
import type {FlowReadStatesBody, FlowStaticSpec} from '../../../../../../shared/yt-types';
import type {Page} from '@playwright/test';
import {expect, test} from '../../../../../playwright-components/core';
import {FlowStateTabsStories} from '../__stories__';
import {createStateReadHandlers, stateResponse} from '../FlowStateSection/__stories__/mocks';

const keyedSpec: FlowStaticSpec = {
    computations: {
        checkout: {
            group_by_schema: [
                {name: 'id', type: 'uint64'},
                {name: 'label', type: 'string'},
            ],
        },
    },
};

const UNSUPPORTED_URL_FILTERS =
    'The link carries unsupported filters; change a filter or reset the filters to load states';

const PICK_SCOPE = 'Select a computation or a partition to load states';

const INVALID_KEY_DRAFT = 'Enter a flat YSON list in brackets';

const int64Spec: FlowStaticSpec = {
    computations: {checkout: {group_by_schema: [{name: 'id', type: 'int64'}]}},
};

type AppHistoryWindow = Window & {
    appBrowserHistory: {push(path: string): void; goBack(): void; goForward(): void};
};

function pushHistory(page: Page, path: string) {
    return page.evaluate(
        (next) => (window as unknown as AppHistoryWindow).appBrowserHistory.push(next),
        path,
    );
}

function goBack(page: Page) {
    return page.evaluate(() => (window as unknown as AppHistoryWindow).appBrowserHistory.goBack());
}

function goForward(page: Page) {
    return page.evaluate(() =>
        (window as unknown as AppHistoryWindow).appBrowserHistory.goForward(),
    );
}

function stateNameForRead({name, key}: FlowReadStatesBody): string {
    if (name) {
        return name;
    }
    if (key && typeof key === 'object' && 'label' in key && typeof key.label === 'string') {
        return `/${key.label}`;
    }
    return '/initial';
}

function recordStateReads(
    requests: Array<FlowReadStatesBody>,
    options: Parameters<typeof createStateReadHandlers>[1] = {spec: keyedSpec},
) {
    return createStateReadHandlers(async (body) => {
        requests.push(body);
        return stateResponse(stateNameForRead(body));
    }, options);
}

function legacySeedSearch(label: string): string {
    return `?${new URLSearchParams({
        path: '//pipeline',
        heavyHitterSeed: JSON.stringify({keyValues: {id: '7', label}}),
    })}`;
}

test('FlowStateTabs: a copied pipeline url restores the form and the read body', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const keyText = '[9007199254740993u; "Веник"]';
    await mount(
        <FlowStateTabsStories.PipelineTab
            initialUrl={`/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=key_state&stateName=/counter&stateKey=${encodeURIComponent(keyText)}`}
        />,
    );
    await expect(page.getByRole('textbox', {name: 'Key', exact: true})).toHaveValue(keyText);
    await expect(page.getByRole('textbox', {name: 'State', exact: true})).toHaveValue('/counter');
    await expect(page.getByRole('table')).toContainText('/counter');
    expect(requests).toEqual([
        {
            computation_id: 'checkout',
            limit: 10,
            target: 'key_state',
            name: '/counter',
            key: {id: {$type: 'uint64', $value: '9007199254740993'}, label: 'Веник'},
        },
    ]);
    await expect(page.getByTestId('flow-routed-location')).toContainText('stateName=/counter');
});

test('FlowStateTabs: pipeline edits are mirrored into the url and an invalid draft blocks reads', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=key_state" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const table = page.getByRole('table');
    await expect(table.getByText('/initial', {exact: true})).toBeVisible();
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=key_state',
    );
    const name = page.getByRole('textbox', {name: 'State', exact: true});
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await name.fill('/counter');
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=key_state&stateName=/counter',
    );
    await page.clock.runFor(500);
    await expect.poll(() => requests.at(-1)?.name).toBe('/counter');
    const requestsBeforeDraft = requests.length;
    await key.fill('[9007199254740993');
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=key_state&stateName=/counter&stateKey=%5B9007199254740993',
    );
    await page.clock.runFor(500);
    await expect(page.getByText('Enter a flat YSON list in brackets')).toBeVisible();
    expect(requests).toHaveLength(requestsBeforeDraft);
    await key.fill('[9007199254740993u; "Веник"]');
    await expect(location).toContainText('stateKey=%5B9007199254740993u;%20%22');
    await page.clock.runFor(500);
    await expect
        .poll(() => requests.at(-1)?.key)
        .toEqual({
            id: {$type: 'uint64', $value: '9007199254740993'},
            label: 'Веник',
        });
    await page.getByRole('button', {name: 'Reset filters'}).click();
    await expect(location).toHaveText('/hahn/flows/state?path=//pipeline&stateKind=all');
    await expect(page.getByText(PICK_SCOPE)).toBeVisible();
});

test('FlowStateTabs: legacy heavy hitter link bytes seed the computation tab exactly, on fresh mount and on in-app push, and stay its reset baseline', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    expect(legacySeedSearch('a b+c')).toBe(
        '?path=%2F%2Fpipeline&heavyHitterSeed=%7B%22keyValues%22%3A%7B%22id%22%3A%227%22%2C%22label%22%3A%22a+b%2Bc%22%7D%7D',
    );
    await mount(
        <FlowStateTabsStories.ComputationTab
            initialUrl={`/hahn/flows/computations/checkout/state${legacySeedSearch('a b+c')}`}
        />,
    );
    const location = page.getByTestId('flow-routed-location');
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    await expect.poll(() => requests.some((body) => body.key !== undefined)).toBe(true);
    expect(requests.find((body) => body.key !== undefined)).toEqual({
        computation_id: 'checkout',
        limit: 10,
        key: {id: {$type: 'uint64', $value: '7'}, label: 'a b+c'},
    });
    await expect(key).toHaveValue('[7u;"a b+c"]');
    await expect(location).toContainText('heavyHitterSeed=');
    await expect(location).toContainText('%22a%20b%2Bc%22');
    await page.evaluate(
        (search) =>
            (window as unknown as AppHistoryWindow).appBrowserHistory.push(
                `/hahn/flows/computations/checkout/state${search}`,
            ),
        legacySeedSearch('x y+z'),
    );
    await expect(key).toHaveValue('[7u;"x y+z"]');
    await expect
        .poll(() => requests.at(-1)?.key)
        .toEqual({id: {$type: 'uint64', $value: '7'}, label: 'x y+z'});
    await key.fill('[8u; "z"]');
    await expect(location).toContainText('stateKey=%5B8u;%20%22z%22%5D');
    await expect(location).toContainText('heavyHitterSeed=');
    await page.getByRole('button', {name: 'Reset filters'}).click();
    await expect(location).not.toContainText('stateKey=%5B8u');
    await expect(location).toContainText('stateKey=%5B7u;%22x%20y%2Bz%22%5D');
    await expect(key).toHaveValue('[7u;"x y+z"]');
});

test('FlowStateTabs: explicit url filters win over the legacy seed and the fixed computation ignores stateComputation', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const seed = encodeURIComponent(JSON.stringify({keyValues: {id: '7', label: 'alice'}}));
    await mount(
        <FlowStateTabsStories.ComputationTab
            initialUrl={`/hahn/flows/computations/checkout/state?path=//pipeline&stateKind=key_state&stateName=/explicit&heavyHitterSeed=${seed}&stateComputation=archive`}
        />,
    );
    await expect(page.getByRole('table')).toContainText('/explicit');
    expect(requests).toEqual([
        {computation_id: 'checkout', limit: 10, target: 'key_state', name: '/explicit'},
    ]);
    await expect(page.getByRole('textbox', {name: 'State', exact: true})).toHaveValue('/explicit');
});

test('FlowStateTabs: leaving the tab clears its filters and back navigation restores them', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(async (body) => {
            requests.push(body);
            return stateResponse(body.name ?? '/initial');
        }),
    );
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateName=/one" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const name = page.getByRole('button', {name: 'State /one', exact: true});
    await expect(page.getByRole('table')).toContainText('/one');
    await page.evaluate(() =>
        (window as unknown as AppHistoryWindow).appBrowserHistory.push(
            '/hahn/flows/graph?path=//pipeline',
        ),
    );
    await expect(location).toHaveText('/hahn/flows/graph?path=//pipeline');
    await expect(name).toHaveCount(0);
    await page.evaluate(() => (window as unknown as AppHistoryWindow).appBrowserHistory.goBack());
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateName=/one',
    );
    await expect(name).toBeVisible();
    await expect(page.getByRole('table')).toContainText('/one');
    expect(requests.filter((body) => body.name === '/one').length).toBeGreaterThanOrEqual(1);
});

test('FlowStateTabs: an unrecognized state kind in a pipeline url blocks reads and the next change repairs the url', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=bogus&stateName=/counter" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const message = page.getByText(UNSUPPORTED_URL_FILTERS);
    const name = page.getByRole('button', {name: 'State /counter', exact: true});
    await expect(message).toBeVisible();
    await expect(name).toBeVisible();
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKind=bogus&stateName=/counter',
    );
    await page.clock.runFor(1000);
    expect(requests).toHaveLength(0);
    await page.clock.resume();
    await name.click();
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout',
    );
    await expect.poll(() => requests).toEqual([{computation_id: 'checkout', limit: 10}]);
    await expect(message).toHaveCount(0);
});

test('FlowStateTabs: an undecodable key text in a pipeline url blocks reads without throwing', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKey=%5B%ZZ" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const message = page.getByText(UNSUPPORTED_URL_FILTERS);
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    await expect(message).toBeVisible();
    await expect(location).toContainText('stateKey=%00%255B%25ZZ');
    await page.clock.runFor(1000);
    expect(requests).toHaveLength(0);
    await expect(key).toHaveValue('');
    await key.fill('[7u; "alice"]');
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKey=%5B7u;%20%22alice%22%5D',
    );
    await page.clock.runFor(500);
    await expect
        .poll(() => requests)
        .toEqual([
            {
                computation_id: 'checkout',
                limit: 10,
                key: {id: {$type: 'uint64', $value: '7'}, label: 'alice'},
            },
        ]);
    await expect(message).toHaveCount(0);
});

test('FlowStateTabs: an unrecognized state kind in a computation url blocks reads until reset', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await mount(
        <FlowStateTabsStories.ComputationTab initialUrl="/hahn/flows/computations/checkout/state?path=//pipeline&stateKind=__proto__" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const message = page.getByText(UNSUPPORTED_URL_FILTERS);
    await expect(message).toBeVisible();
    await expect(location).toHaveText(
        '/hahn/flows/computations/checkout/state?path=//pipeline&stateKind=__proto__',
    );
    await page.clock.runFor(1000);
    expect(requests).toHaveLength(0);
    await page.getByRole('button', {name: 'Reset filters'}).click();
    await expect(location).toHaveText('/hahn/flows/computations/checkout/state?path=//pipeline');
    await page.clock.runFor(500);
    await expect.poll(() => requests).toEqual([{computation_id: 'checkout', limit: 10}]);
    await expect(message).toHaveCount(0);
});

test('FlowStateTabs: an undecodable state name and an unparseable seed in a computation url block reads until reset', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                requests.push(body);
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await mount(
        <FlowStateTabsStories.ComputationTab initialUrl="/hahn/flows/computations/checkout/state?path=//pipeline&stateName=%E0&heavyHitterSeed=%7Bnot-json" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const message = page.getByText(UNSUPPORTED_URL_FILTERS);
    await expect(message).toBeVisible();
    await expect(page.getByRole('button', {name: 'State State', exact: true})).toBeVisible();
    await expect(location).toContainText('stateName=%00%25E0');
    await expect(location).toContainText('heavyHitterSeed=%7Bnot-json');
    await page.clock.runFor(1000);
    expect(requests).toHaveLength(0);
    await page.getByRole('button', {name: 'Reset filters'}).click();
    await expect(location).toHaveText('/hahn/flows/computations/checkout/state?path=//pipeline');
    await page.clock.runFor(500);
    await expect.poll(() => requests).toEqual([{computation_id: 'checkout', limit: 10}]);
    await expect(message).toHaveCount(0);
});

for (const route of ['pipeline', 'computation'] as const) {
    for (const [pathLabel, pathQuery] of [
        ['malformed', 'path=%2F%2Fpipeline%ZZ'],
        ['empty', ''],
    ] as const) {
        test(`FlowStateTabs: a ${pathLabel} pipeline path blocks both queries on ${route} State without promising a filter fix`, async ({
            mount,
            page,
            router,
        }) => {
            const specRequests: Array<string> = [];
            const readRequests: Array<FlowReadStatesBody> = [];
            const pageErrors: Array<Error> = [];
            page.on('request', (request) => {
                if (request.url().includes('/api/v4/get_pipeline_spec')) {
                    specRequests.push(request.url());
                }
            });
            page.on('pageerror', (error) => pageErrors.push(error));
            await router.use(
                ...createStateReadHandlers(async (body) => {
                    readRequests.push(body);
                    return stateResponse('/unexpected');
                }),
            );
            const clockTime = new Date('2026-01-01T00:00:00Z');
            await page.clock.install({time: clockTime});
            await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
            const pipelineSearch = [pathQuery, 'stateComputation=checkout']
                .filter(Boolean)
                .join('&');
            const initialUrl =
                route === 'pipeline'
                    ? `/hahn/flows/state?${pipelineSearch}`
                    : `/hahn/flows/computations/checkout/state${pathQuery ? `?${pathQuery}` : ''}`;
            await mount(
                route === 'pipeline' ? (
                    <FlowStateTabsStories.PipelineTab initialUrl={initialUrl} />
                ) : (
                    <FlowStateTabsStories.ComputationTab initialUrl={initialUrl} />
                ),
            );
            const reset = page.getByRole('button', {name: 'Reset filters'});
            await expect(reset).toBeVisible();
            await page.clock.runFor(1000);
            expect(specRequests).toHaveLength(0);
            expect(readRequests).toHaveLength(0);
            expect(pageErrors).toHaveLength(0);
            await expect(page.getByText(UNSUPPORTED_URL_FILTERS)).toHaveCount(0);
            await reset.click();
            await page.clock.runFor(1000);
            expect(specRequests).toHaveLength(0);
            expect(readRequests).toHaveLength(0);
            await expect(page.getByText(UNSUPPORTED_URL_FILTERS)).toHaveCount(0);
        });
    }
}

test('FlowStateTabs: a cleared pipeline form stays cleared after history navigation and reopening the copied url', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(...recordStateReads(requests));
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const pickScope = page.getByText(PICK_SCOPE);
    const emptyComputation = page.getByRole('button', {
        name: 'Computation Computation',
        exact: true,
    });
    const selectedComputation = page.getByRole('button', {
        name: 'Computation Checkout',
        exact: true,
    });
    await expect(page.getByRole('table')).toContainText('/initial');
    await selectedComputation.click();
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    const clearedUrl = '/hahn/flows/state?path=//pipeline&stateKind=all';
    await expect(location).toHaveText(clearedUrl);
    await expect(pickScope).toBeVisible();
    await pushHistory(page, '/hahn/flows/graph?path=//pipeline');
    await expect(location).toHaveText('/hahn/flows/graph?path=//pipeline');
    await goBack(page);
    await expect(location).toHaveText(clearedUrl);
    await expect(emptyComputation).toBeVisible();
    await goForward(page);
    await expect(location).toHaveText('/hahn/flows/graph?path=//pipeline');
    await pushHistory(page, clearedUrl);
    await expect(location).toHaveText(clearedUrl);
    await expect(emptyComputation).toBeVisible();
    await expect(pickScope).toBeVisible();
    await expect(selectedComputation).toHaveCount(0);
    expect(requests).toEqual([{computation_id: 'checkout', limit: 10}]);
});

test('FlowStateTabs: a cleared seeded key stays cleared after history navigation and reopening the copied url while reset restores the seed', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(...recordStateReads(requests));
    await mount(
        <FlowStateTabsStories.ComputationTab
            initialUrl={`/hahn/flows/computations/checkout/state${legacySeedSearch('alice')}`}
        />,
    );
    const location = page.getByTestId('flow-routed-location');
    const table = page.getByRole('table');
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    const seedKey = {id: {$type: 'uint64', $value: '7'}, label: 'alice'};
    await expect(key).toHaveValue('[7u;"alice"]');
    await expect(table).toContainText('/alice');
    expect(requests.at(-1)?.key).toEqual(seedKey);
    await key.fill('');
    await expect(location).toContainText('stateKind=all');
    await expect(location).toContainText('heavyHitterSeed=');
    await expect(table).toContainText('/initial');
    const clearedUrl = (await location.textContent()) ?? '';
    await pushHistory(page, '/hahn/flows/graph?path=//pipeline');
    await expect(location).toHaveText('/hahn/flows/graph?path=//pipeline');
    await goBack(page);
    await expect(location).toHaveText(clearedUrl);
    await expect(key).toHaveValue('');
    await expect(table).toContainText('/initial');
    await pushHistory(page, '/hahn/flows/graph?path=//pipeline');
    await pushHistory(page, clearedUrl);
    await expect(location).toHaveText(clearedUrl);
    await expect(key).toHaveValue('');
    await expect(table).toContainText('/initial');
    expect(requests.filter((body) => body.key === undefined)).toEqual([
        {computation_id: 'checkout', limit: 10},
    ]);
    await page.getByRole('button', {name: 'Reset filters'}).click();
    await expect(key).toHaveValue('[7u;"alice"]');
    await expect(table).toContainText('/alice');
});

test('FlowStateTabs: a pipeline computation left in the store does not replace the computation seed on back navigation', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(...recordStateReads(requests));
    await mount(
        <FlowStateTabsStories.StateRoutes
            initialUrl={`/hahn/flows/computations/checkout/state${legacySeedSearch('alice')}`}
        />,
    );
    const location = page.getByTestId('flow-routed-location');
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    const seedRead = {
        computation_id: 'checkout',
        limit: 10,
        key: {id: {$type: 'uint64', $value: '7'}, label: 'alice'},
    };
    await expect(key).toHaveValue('[7u;"alice"]');
    await expect(page.getByRole('table')).toContainText('/alice');
    expect(requests.at(-1)).toEqual(seedRead);
    await pushHistory(page, '/hahn/flows/state?path=//pipeline');
    await expect(key).toHaveValue('');
    await key.fill('[8u; "z"]');
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKey=%5B8u;%20%22z%22%5D',
    );
    await expect
        .poll(() => requests.at(-1)?.key)
        .toEqual({id: {$type: 'uint64', $value: '8'}, label: 'z'});
    const requestsBeforeBack = requests.length;
    await goBack(page);
    await expect(location).toContainText('/hahn/flows/computations/checkout/state?');
    await expect(location).toContainText('heavyHitterSeed=');
    await expect(key).toHaveValue('[7u;"alice"]');
    await expect(page.getByRole('table')).toContainText('/alice');
    expect(requests.slice(requestsBeforeBack)).toEqual([]);
    expect(requests).toContainEqual(seedRead);
    await goForward(page);
    await expect(location).toContainText('/hahn/flows/state?');
    await expect(key).toHaveValue('[8u; "z"]');
});

test('FlowStateTabs: a malformed pipeline computation does not block a clean computation url', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(...recordStateReads(requests));
    const specLoaded = page.waitForResponse((response) =>
        response.url().includes('/api/v4/get_pipeline_spec'),
    );
    await mount(
        <FlowStateTabsStories.StateRoutes initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=%ZZ" />,
    );
    const message = page.getByText(UNSUPPORTED_URL_FILTERS);
    await expect(message).toBeVisible();
    await specLoaded;
    await pushHistory(page, `/hahn/flows/computations/checkout/state${legacySeedSearch('alice')}`);
    await expect(page.getByRole('textbox', {name: 'Key', exact: true})).toHaveValue('[7u;"alice"]');
    await expect
        .poll(() => requests)
        .toEqual([
            {
                computation_id: 'checkout',
                limit: 10,
                key: {id: {$type: 'uint64', $value: '7'}, label: 'alice'},
            },
        ]);
    await expect(message).toHaveCount(0);
});

test('FlowStateTabs: a pipeline path change after an own edit restores the edited form', async ({
    mount,
    page,
    router,
}) => {
    const reads: Array<{pipelinePath: unknown; body: FlowReadStatesBody}> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body, parameters) => {
                reads.push({pipelinePath: parameters.pipeline_path, body});
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    const filters = 'stateComputation=checkout&stateKind=key_state';
    await mount(
        <FlowStateTabsStories.PipelineTab
            initialUrl={`/hahn/flows/state?path=//A&${filters}&stateName=/old`}
        />,
    );
    const location = page.getByTestId('flow-routed-location');
    const name = page.getByRole('textbox', {name: 'State', exact: true});
    const nameRead = (pipelinePath: string, stateName: string) => ({
        pipelinePath,
        body: {computation_id: 'checkout', limit: 10, target: 'key_state', name: stateName},
    });
    await expect(name).toHaveValue('/old');
    await name.fill('/new');
    await expect(location).toHaveText(`/hahn/flows/state?path=//A&${filters}&stateName=/new`);
    await expect.poll(() => reads.at(-1)).toEqual(nameRead('//A', '/new'));
    await pushHistory(page, `/hahn/flows/state?path=//B&${filters}&stateName=/new`);
    await expect.poll(() => reads.at(-1)).toEqual(nameRead('//B', '/new'));
    await expect(name).toHaveValue('/new');
    expect(reads.filter(({pipelinePath}) => pipelinePath === '//B')).toEqual([
        nameRead('//B', '/new'),
    ]);
    await pushHistory(page, `/hahn/flows/state?path=//B&${filters}&stateName=/external`);
    await expect(name).toHaveValue('/external');
    await expect.poll(() => reads.at(-1)).toEqual(nameRead('//B', '/external'));
});

test('FlowStateTabs: a pipeline path change after repairing a malformed url keeps reads unblocked', async ({
    mount,
    page,
    router,
}) => {
    const reads: Array<{pipelinePath: unknown; body: FlowReadStatesBody}> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body, parameters) => {
                reads.push({pipelinePath: parameters.pipeline_path, body});
                return stateResponse(body.name ?? '/initial');
            },
            {spec: keyedSpec},
        ),
    );
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//A&stateComputation=checkout&stateKind=bogus&stateName=/counter" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const message = page.getByText(UNSUPPORTED_URL_FILTERS);
    await expect(message).toBeVisible();
    await page.getByRole('button', {name: 'State /counter', exact: true}).click();
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    await expect(location).toHaveText('/hahn/flows/state?path=//A&stateComputation=checkout');
    await expect
        .poll(() => reads.at(-1))
        .toEqual({pipelinePath: '//A', body: {computation_id: 'checkout', limit: 10}});
    await pushHistory(page, '/hahn/flows/state?path=//B&stateComputation=checkout');
    await expect
        .poll(() => reads.at(-1))
        .toEqual({pipelinePath: '//B', body: {computation_id: 'checkout', limit: 10}});
    await expect(message).toHaveCount(0);
});

test('FlowStateTabs: a restored key waits for a rejected spec, shows its error and reads the exact key after recovery', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    let specAttempts = 0;
    await router.use(
        ...recordStateReads(requests, {
            loadSpec: async () => {
                specAttempts += 1;
                if (specAttempts === 1) {
                    throw new Error('Static spec is unavailable');
                }
                return int64Spec;
            },
        }),
    );
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    const specRejected = page.waitForResponse(
        (response) =>
            response.url().includes('/api/v4/get_pipeline_spec') && response.status() === 500,
    );
    await mount(
        <FlowStateTabsStories.ComputationTab initialUrl="/hahn/flows/computations/checkout/state?path=//pipeline&stateKey=%5B9007199254740993%5D" />,
    );
    await specRejected;
    await page.clock.runFor(1000);
    const specError = page.getByText('Static spec is unavailable');
    await expect.soft(specError).toBeVisible();
    expect(requests).toEqual([]);
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    await expect(key).toHaveValue('[9007199254740993]');
    await key.fill('[9007199254740995]');
    await page.clock.runFor(1000);
    const exactRead = (value: string) => ({
        computation_id: 'checkout',
        limit: 10,
        key: {id: {$type: 'int64', $value: value}},
    });
    await expect.poll(() => requests.at(-1)).toEqual(exactRead('9007199254740995'));
    for (const request of requests) {
        expect([exactRead('9007199254740993'), exactRead('9007199254740995')]).toContainEqual(
            request,
        );
    }
    await expect(specError).toHaveCount(0);
});

for (const [schemaLabel, spec, keyText, expectedKey] of [
    [
        'schema-backed',
        int64Spec,
        '[9007199254740993]',
        {id: {$type: 'int64', $value: '9007199254740993'}},
    ],
    ['schema-less', {computations: {checkout: {}}}, '["alice",7]', ['alice', 7]],
] as const) {
    test(`FlowStateTabs: a restored ${schemaLabel} key waits for a delayed spec and reads it exactly`, async ({
        mount,
        page,
        router,
    }) => {
        const requests: Array<FlowReadStatesBody> = [];
        let releaseSpec!: (value: FlowStaticSpec) => void;
        const delayedSpec = new Promise<FlowStaticSpec>((resolve) => {
            releaseSpec = resolve;
        });
        await router.use(...recordStateReads(requests, {loadSpec: () => delayedSpec}));
        const clockTime = new Date('2026-01-01T00:00:00Z');
        await page.clock.install({time: clockTime});
        await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
        await mount(
            <FlowStateTabsStories.ComputationTab
                initialUrl={`/hahn/flows/computations/checkout/state?path=//pipeline&stateKey=${encodeURIComponent(keyText)}`}
            />,
        );
        await expect(page.getByRole('button', {name: 'Reset filters'})).toBeVisible();
        await page.clock.runFor(1000);
        expect(requests).toEqual([]);
        releaseSpec(spec);
        await page.clock.runFor(1000);
        await expect
            .poll(() => requests)
            .toEqual([{computation_id: 'checkout', limit: 10, key: expectedKey}]);
    });
}

function partitionAwareReads(requests: Array<FlowReadStatesBody>) {
    return createStateReadHandlers(
        async (body) => {
            requests.push(body);
            return {
                ...(body.partition_id ? {} : stateResponse('/initial')),
                partition_states: [
                    {computation_id: 'checkout', partition_id: 'p3', states: {'/p': {events: 1}}},
                ],
            };
        },
        {spec: keyedSpec, partitions: ['p1', 'p2']},
    );
}

test('FlowStateTabs: partition selection and partition cells read despite an invalid hidden key draft', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(...partitionAwareReads(requests));
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout" />,
    );
    const location = page.getByTestId('flow-routed-location');
    const table = page.getByRole('table');
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    await expect(table).toContainText('/initial');
    await key.fill('[7');
    await expect(page.getByText(INVALID_KEY_DRAFT)).toBeVisible();
    await page.getByRole('button', {name: 'Partition Partition', exact: true}).click();
    await page.getByRole('option', {name: 'p2', exact: true}).click();
    await expect(location).toContainText('statePartition=p2');
    await expect(location).toContainText('stateKey=%5B7');
    await expect.poll(() => requests.at(-1)).toEqual({partition_id: 'p2', limit: 10});
    await expect(key).toHaveCount(0);
    await table.getByRole('button', {name: 'p3', exact: true}).click();
    await expect(location).toContainText('statePartition=p3');
    await expect.poll(() => requests.at(-1)).toEqual({partition_id: 'p3', limit: 10});
    const requestsBeforeClear = requests.length;
    await page.getByRole('button', {name: /^Partition p3$/i}).click();
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    await expect(key).toHaveValue('[7');
    await expect(page.getByText(INVALID_KEY_DRAFT)).toBeVisible();
    await expect(location).toHaveText(
        '/hahn/flows/state?path=//pipeline&stateComputation=checkout&stateKey=%5B7',
    );
    expect(requests).toHaveLength(requestsBeforeClear);
});

test('FlowStateTabs: a restored partition url reads its partition despite an invalid key draft', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    await router.use(...partitionAwareReads(requests));
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(new Date(clockTime.getTime() + 1000));
    await mount(
        <FlowStateTabsStories.PipelineTab initialUrl="/hahn/flows/state?path=//pipeline&stateComputation=checkout&statePartition=p1&stateKey=%5B7" />,
    );
    const key = page.getByRole('textbox', {name: 'Key', exact: true});
    await page.clock.runFor(1000);
    await expect.poll(() => requests).toEqual([{partition_id: 'p1', limit: 10}]);
    await expect(key).toHaveCount(0);
    await page.getByRole('button', {name: /^Partition p1$/i}).click();
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    await expect(key).toHaveValue('[7');
    await expect(page.getByText(INVALID_KEY_DRAFT)).toBeVisible();
    await page.clock.runFor(1000);
    expect(requests).toEqual([{partition_id: 'p1', limit: 10}]);
});

test('FlowStateTabs: a seeded key edited before a delayed spec resolves is mirrored once the spec arrives', async ({
    mount,
    page,
    router,
}) => {
    const requests: Array<FlowReadStatesBody> = [];
    let releaseSpec!: (value: FlowStaticSpec) => void;
    const delayedSpec = new Promise<FlowStaticSpec>((resolve) => {
        releaseSpec = resolve;
    });
    await router.use(
        ...recordStateReads(requests, {loadSpec: () => delayedSpec, partitions: ['p1']}),
    );
    await mount(
        <FlowStateTabsStories.ComputationTab
            initialUrl={`/hahn/flows/computations/checkout/state${legacySeedSearch('alice')}`}
        />,
    );
    const location = page.getByTestId('flow-routed-location');
    const selectedPartition = page.getByRole('button', {name: /^Partition p1$/i});
    await page.getByRole('button', {name: 'Partition Partition', exact: true}).click();
    await page.getByRole('option', {name: 'p1', exact: true}).click();
    await expect(selectedPartition).toBeVisible();
    releaseSpec(keyedSpec);
    await expect(location).toContainText('statePartition=p1');
    await expect(location).toContainText('stateKey=%5B7u;%22alice%22%5D');
    const copiedUrl = (await location.textContent()) ?? '';
    await pushHistory(page, '/hahn/flows/graph?path=//pipeline');
    await pushHistory(page, copiedUrl);
    await expect(location).toHaveText(copiedUrl);
    await selectedPartition.click();
    await page.getByRole('button', {name: 'Clear', exact: true}).click();
    await expect(page.getByRole('textbox', {name: 'Key', exact: true})).toHaveValue('[7u;"alice"]');
});
