import React from 'react';
import {type Locator} from '@playwright/test';
import {http} from 'msw';

import {test as base, expect} from '../../../../../../playwright-components/core';
import {Tree} from '../__stories__/AccountsGeneralTab.stories';
import {createAccountsMock, makeAccount, readParameters} from '../__stories__/mocks';

const test = base.extend<{api: ReturnType<typeof createAccountsMock>}>({
    api: async ({router}, use) => {
        const api = createAccountsMock();
        await router.use(...api.handlers);
        await use(api);
    },
});

test.setTimeout(30_000);

function row(component: Locator, name: string) {
    return component.getByRole('row', {name: new RegExp(`^${name}(?:\\s|$)`)});
}

function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
        resolve = done;
    });
    return {promise, resolve};
}

test('AccountsLoading: modes show the right branches and resource values', async ({mount, api}) => {
    const component = await mount(<Tree />);
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(row(component, 'usable-only').getByText('22', {exact: true})).toBeVisible();
    await expect(row(component, 'parent').getByText('90', {exact: true})).toBeVisible();
    await expect(row(component, 'hidden')).toHaveCount(0);
    expect(
        api.requests.filter(({command}) => command === 'execute_batch')[0].parameters.requests,
    ).toHaveLength(3);

    await test.step('Favourites keeps its parent and hides other children', async () => {
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(row(component, 'usable-only')).toHaveCount(0);
        await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
        await expect(row(component, 'parent').getByText('90', {exact: true})).toBeVisible();
    });

    await test.step('All includes resources of the hidden child', async () => {
        await component.getByRole('radio', {name: 'All', exact: true}).check();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
    });
});

test('AccountsLoading: removing the last favourite removes its parent', async ({mount, api}) => {
    const component = await mount(<Tree initialMode="favourites" />);
    const child = row(component, 'child');
    await expect(child.getByText('11', {exact: true})).toBeVisible();
    await child.getByTestId('account-favourite-child').click();
    await expect(component.getByText('No items to show')).toBeVisible();
    await expect(row(component, 'parent')).toHaveCount(0);
    const batches = api.requests.filter(({command}) => command === 'execute_batch');
    expect(batches).toHaveLength(1);
});

test('AccountsLoading: selected account outside Favourites still has resources', async ({
    mount,
    api: _api,
}) => {
    const component = await mount(<Tree initialMode="favourites" activeAccount="hidden" />);
    await expect(row(component, 'hidden').getByText('57', {exact: true})).toBeVisible();
});

for (const mode of ['usable', 'favourites'] as const) {
    test(`AccountsLoading: empty ${mode} does not load resources`, async ({mount, api}) => {
        api.usable = [];
        const component = await mount(<Tree initialMode={mode} favourites={[]} />);
        await expect(component.getByText('No items to show')).toBeVisible();
        expect(api.requests.some(({command}) => command === 'execute_batch')).toBe(false);
        expect(api.requests.filter(({command}) => command === 'list')).toHaveLength(1);
    });
}

test('AccountsLoading: a pending resource response shows loading then the actual value', async ({
    mount,
    router,
    api,
}) => {
    const release = deferred();
    const started = deferred();
    await router.use(
        http.post('*/api/v3/execute_batch', async ({request}) => {
            started.resolve();
            await release.promise;
            return api.respond(request);
        }),
    );
    const component = await mount(<Tree />);
    await started.promise;
    await expect(row(component, 'child')).toBeVisible();
    await expect(row(component, 'child').getByText('11', {exact: true})).toHaveCount(0);
    release.resolve();
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
});

test('AccountsLoading: usable failure stays filtered and recovers on refresh', async ({
    mount,
    router,
    api,
}) => {
    let fail = true;
    await router.use(
        http.post('*/api/v3/get', async ({request}) => {
            const {path} = await readParameters(request);
            if (fail && path?.endsWith('/@usable_accounts')) {
                return Response.json({code: 500, message: 'Usable is unavailable'}, {status: 500});
            }
            return api.respond(request);
        }),
    );
    const component = await mount(<Tree />);
    await expect(component.getByText('Usable is unavailable', {exact: true})).toBeVisible();
    await expect(row(component, 'hidden')).toHaveCount(0);
    expect(api.requests.some(({command}) => command === 'execute_batch')).toBe(false);
    fail = false;
    await component.getByRole('button', {name: 'Refresh accounts'}).click();
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(component.getByText('Usable is unavailable', {exact: true})).toHaveCount(0);
});

test('AccountsLoading: partial batch keeps successful resources and recovers', async ({
    mount,
    router,
    api,
}) => {
    let fail = true;
    await router.use(
        http.post('*/api/v3/execute_batch', async ({request}) => {
            const response = await api.respond(request);
            const items = await response.json();
            const {requests = []} = await readParameters(request);
            return Response.json(
                items.map((item: unknown, index: number) =>
                    fail && requests[index].parameters.path?.endsWith('/child')
                        ? {error: {code: 500, message: 'Child is unavailable'}}
                        : item,
                ),
            );
        }),
    );
    const component = await mount(<Tree />);
    await expect(
        component.getByText('Failed to load account resources', {exact: true}),
    ).toBeVisible();
    await expect(row(component, 'parent').getByText('90', {exact: true})).toBeVisible();
    await expect(row(component, 'child').getByText('11', {exact: true})).toHaveCount(0);
    fail = false;
    await component.getByRole('button', {name: 'Refresh accounts'}).click();
    await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    await expect(
        component.getByText('Failed to load account resources', {exact: true}),
    ).toHaveCount(0);
});

for (const mode of ['all', 'usable'] as const) {
    test(`AccountsLoading: ${mode} metadata failure finishes loading and can retry`, async ({
        mount,
        router,
        api,
    }) => {
        let fail = true;
        await router.use(
            http.all('*/api/v3/*', async ({request}) => {
                const {attributes = []} = await readParameters(request);
                const batch = new URL(request.url).pathname.endsWith('/execute_batch');
                if (fail && (batch || attributes.includes('resource_usage'))) {
                    return Response.json(
                        {code: 500, message: 'Resources are unavailable'},
                        {status: 500},
                    );
                }
                return api.respond(request);
            }),
        );
        const component = await mount(<Tree initialMode={mode} />);
        await expect(component.getByText('Resources are unavailable', {exact: true})).toBeVisible();
        fail = false;
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        if (mode === 'all') await component.getByTestId('account-tree-toggle-parent').click();
        await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
        await expect(component.getByText('Resources are unavailable', {exact: true})).toHaveCount(
            0,
        );
    });
}

for (const finish of ['success', 'failure'] as const) {
    test(`AccountsLoading: ignores old ${finish} after switching modes`, async ({
        mount,
        router,
        api,
    }) => {
        const started = deferred();
        const release = deferred();
        const delivered = deferred();
        let pending = true;
        await router.use(
            http.post('*/api/v3/list', async ({request}) => {
                const {attributes = []} = await readParameters(request);
                if (pending && attributes.includes('resource_usage')) {
                    pending = false;
                    started.resolve();
                    await release.promise;
                    delivered.resolve();
                    return finish === 'success'
                        ? api.respond(request)
                        : Response.json({code: 500, message: 'Old failure'}, {status: 500});
                }
                return api.respond(request);
            }),
        );
        const component = await mount(<Tree initialMode="all" />);
        await started.promise;
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
        release.resolve();
        await delivered.promise;
        await expect(row(component, 'hidden')).toHaveCount(0);
        await expect(component.getByText('Old failure', {exact: true})).toHaveCount(0);
        await expect(row(component, 'child').getByText('11', {exact: true})).toBeVisible();
    });
}

for (const count of [299, 300]) {
    test(`AccountsLoading: ${count} selected children count their parent toward the batch limit`, async ({
        mount,
        api,
    }) => {
        api.usable = Array.from({length: count}, (_, index) => `child-${index}`);
        api.accounts = [
            makeAccount('parent'),
            ...api.usable.map((name) => makeAccount(name, 'parent')),
        ];
        const component = await mount(<Tree />);
        await expect(row(component, 'child-0').getByText('7', {exact: true})).toBeVisible();
        const batches = api.requests.filter(({command}) => command === 'execute_batch');
        if (count === 299) {
            expect(batches).toHaveLength(1);
            expect(batches[0].parameters.requests).toHaveLength(300);
            expect(api.requests.filter(({command}) => command === 'list')).toHaveLength(1);
        } else {
            expect(batches).toHaveLength(0);
            expect(api.requests.filter(({command}) => command === 'list')).toHaveLength(2);
        }
        await expect(component.getByRole('radio', {name: 'Usable', exact: true})).toBeChecked();
    });
}

for (const finish of ['success', 'failure'] as const) {
    test(`AccountsLoading: refresh with identical parameters ignores old batch ${finish}`, async ({
        mount,
        router,
        api,
    }) => {
        const started = deferred();
        const release = deferred();
        const delivered = deferred();
        let pending = true;
        await router.use(
            http.post('*/api/v3/execute_batch', async ({request}) => {
                const response = await api.respond(request);
                if (!pending) return response;
                pending = false;
                started.resolve();
                await release.promise;
                delivered.resolve();
                return finish === 'success'
                    ? response
                    : Response.json({code: 500, message: 'Old batch failure'}, {status: 500});
            }),
        );
        const component = await mount(<Tree />);
        await started.promise;
        api.accounts = api.accounts.map((account) =>
            account.$value === 'child' ? makeAccount('child', 'parent', 33) : account,
        );
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
        release.resolve();
        await delivered.promise;
        await expect(component.getByText('Old batch failure', {exact: true})).toHaveCount(0);
        await expect(row(component, 'child').getByText('11', {exact: true})).toHaveCount(0);
        await expect(row(component, 'child').getByText('33', {exact: true})).toBeVisible();
    });
}
