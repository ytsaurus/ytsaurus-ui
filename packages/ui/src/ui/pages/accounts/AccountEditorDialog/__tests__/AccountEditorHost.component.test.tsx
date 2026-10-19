import React from 'react';
import {type Page, type Request} from '@playwright/test';

import {expect, test} from '../../../../playwright-components/core';
import {AccountEditorHostStories} from '../__stories__/index';

const ACCOUNT_NAME = 'account';

const GET_API_PATTERN = /\/api\/v4\/get(?:\?.*)?$/;

async function readParameters(request: Request): Promise<{path?: string}> {
    const headers = await request.allHeaders();
    const value = Object.entries(headers)
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, chunk]) => chunk)
        .join('');

    if (!value) {
        const postData = request.postDataJSON();
        return typeof postData === 'object' && postData !== null ? postData : {};
    }
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
}

function makeAccountNode() {
    return {
        $attributes: {
            abc: {},
            parent_name: 'root',
            resource_limits: {
                disk_space_per_medium: {default: 10},
                node_count: 10,
            },
            resource_usage: {
                disk_space_per_medium: {default: 2},
                node_count: 2,
            },
            recursive_resource_usage: {
                disk_space_per_medium: {default: 2},
                node_count: 2,
            },
            committed_resource_usage: {
                disk_space_per_medium: {default: 2},
                node_count: 2,
            },
            recursive_committed_resource_usage: {
                disk_space_per_medium: {default: 2},
                node_count: 2,
            },
            total_children_resource_limits: {
                disk_space_per_medium: {default: 0},
                node_count: 0,
            },
        },
        $value: {},
    };
}

async function mockAccountEditorData(page: Page, beforeTreeResponse?: () => Promise<void>) {
    await page.route(GET_API_PATTERN, async (route) => {
        const {path} = await readParameters(route.request());
        if (path === `//sys/accounts/${ACCOUNT_NAME}/@path`) {
            await route.fulfill({json: {value: `//sys/account_tree/${ACCOUNT_NAME}`}});
        } else if (path === `//sys/account_tree/${ACCOUNT_NAME}`) {
            await beforeTreeResponse?.();
            await route.fulfill({json: {value: makeAccountNode()}});
        } else {
            await route.fulfill({status: 404, json: {message: `Unexpected path: ${path}`}});
        }
    });
}

test('AccountEditorHost: opening blocks other edit buttons', async ({mount, page}) => {
    const response = await delayAccountTree(page);
    const component = await mount(<AccountEditorHostStories.Opening />);
    await response.requested;

    await expect(component.getByRole('button', {name: 'Edit account'})).toHaveClass(
        /g-button_loading/,
    );
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
    await expect(component.getByRole('button', {name: 'Edit root'})).toBeDisabled();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    response.deliver();
    await response.responded;
});

test('AccountEditorHost: disables Parent for a regular user', async ({mount, page}) => {
    const accountNamesRequests: Array<string> = [];
    page.on('request', (request) => {
        if (request.url().includes('/api/v3/list')) {
            accountNamesRequests.push(request.url());
        }
    });

    await mockAccountEditorData(page);
    await mount(<AccountEditorHostStories.Opened />);

    await expect(page.getByRole('button', {name: 'root', exact: true})).toBeDisabled();
    expect(accountNamesRequests).toHaveLength(0);
});

test('AccountEditorHost: enables Parent for an administrator', async ({mount, page}) => {
    await page.route('**/api/v3/list**', async (route) => {
        await route.fulfill({json: ['parent', 'sibling']});
    });

    await mockAccountEditorData(page);
    await mount(<AccountEditorHostStories.OpenedAsAdmin />);

    await expect(page.getByRole('button', {name: '<Root>', exact: true})).toBeEnabled();
    await page.getByRole('button', {name: '<Root>', exact: true}).click();
    await expect(page.getByText('parent', {exact: true})).toBeVisible();
    await expect(page.getByText('sibling', {exact: true})).toBeVisible();
});

test('AccountEditorHost: reports a loading error and allows retry', async ({mount, page}) => {
    await page.route(GET_API_PATTERN, async (route) => {
        await route.fulfill({
            status: 500,
            json: {message: 'Failed to load account'},
        });
    });
    const component = await mount(<AccountEditorHostStories.LoadedThroughApi />);

    await test.step('Report the loading error and enable editing again', async () => {
        await expect(page.getByText('Failed to load account account')).toBeVisible();
        await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
        await expect(component.getByRole('button', {name: 'Edit another'})).toBeEnabled();
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });

    await test.step('Open the editor after a successful retry', async () => {
        await page.unroute(GET_API_PATTERN);
        await mockAccountEditorData(page);

        await component.getByRole('button', {name: 'Edit account'}).click();
        await expect(page.getByRole('dialog')).toBeVisible();
    });
});

test('AccountEditorHost: keeps the dialog usable after a Parent mutation error', async ({
    mount,
    page,
}) => {
    let resolveMutation: (() => void) | undefined;
    const mutationGate = new Promise<void>((resolve) => {
        resolveMutation = resolve;
    });

    await page.route('**/api/v3/list**', async (route) => {
        await route.fulfill({json: ['other-top-level']});
    });
    await page.route('**/api/v3/set**', async (route) => {
        await mutationGate;
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({message: 'Mutation failed'}),
        });
    });

    await mockAccountEditorData(page);
    await mount(<AccountEditorHostStories.OpenedAsAdmin />);

    await page.getByRole('button', {name: '<Root>', exact: true}).click();
    const requestPromise = page.waitForRequest('**/api/v3/set**');
    const responsePromise = page.waitForResponse('**/api/v3/set**');

    await test.step('Disable Parent while its change is pending', async () => {
        await page.getByText('other-top-level', {exact: true}).click();
        await requestPromise;

        await expect(page.getByRole('button', {name: 'root', exact: true})).toBeDisabled();
    });

    await test.step('Keep the dialog usable after the failed response', async () => {
        resolveMutation?.();
        await responsePromise;

        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.getByRole('button', {name: '<Root>', exact: true})).toBeEnabled();
    });
});

async function delayAccountTree(page: Page) {
    let deliver!: () => void;
    let markRequested!: () => void;
    let markResponded!: () => void;
    const responseGate = new Promise<void>((resolve) => {
        deliver = resolve;
    });
    const requested = new Promise<void>((resolve) => {
        markRequested = resolve;
    });
    const responded = new Promise<void>((resolve) => {
        markResponded = resolve;
    });
    await mockAccountEditorData(page, async () => {
        markRequested();
        await responseGate;
    });
    page.on('response', async (response) => {
        if (GET_API_PATTERN.test(response.url())) {
            const {path} = await readParameters(response.request());
            if (path === '//sys/account_tree/account') {
                await response.finished();
                markResponded();
            }
        }
    });
    return {deliver, requested, responded};
}

for (const action of ['Cancel', 'Unmount host']) {
    test(`AccountEditorHost: ignores late data after ${action}`, async ({mount, page}) => {
        const response = await delayAccountTree(page);
        const component = await mount(<AccountEditorHostStories.OpeningLifecycle />);

        await test.step('Start loading the editor', async () => {
            await component.getByRole('button', {name: 'Open', exact: true}).click();
            await response.requested;
            await expect(component.getByTestId('opening-result')).toHaveText('pending');
        });

        await test.step(`${action} while the response is pending`, async () => {
            await component.getByRole('button', {name: action, exact: true}).click();
            await expect(component.getByTestId('opening-result')).toHaveText(
                action === 'Cancel' ? 'idle' : 'unmounted',
            );
        });

        await test.step('Ignore the late response', async () => {
            response.deliver();
            await response.responded;

            await expect(page.getByRole('dialog')).toHaveCount(0);
            await expect(component.getByTestId('opening-result')).toHaveText(
                action === 'Cancel' ? 'idle' : 'unmounted',
            );
        });
    });
}

test('AccountEditorHost: can reopen after cancelling loading', async ({mount, page}) => {
    const response = await delayAccountTree(page);
    const component = await mount(<AccountEditorHostStories.OpeningLifecycle />);

    await test.step('Start loading the editor', async () => {
        await component.getByRole('button', {name: 'Open', exact: true}).click();
        await response.requested;
        await expect(component.getByTestId('opening-result')).toHaveText('pending');
    });

    await test.step('Cancel loading and open the editor again', async () => {
        await component.getByRole('button', {name: 'Cancel', exact: true}).click();
        await expect(component.getByTestId('opening-result')).toHaveText('idle');

        await component.getByRole('button', {name: 'Open', exact: true}).click();
        await expect(component.getByTestId('opening-result')).toHaveText('pending');
    });

    await test.step('Show the reopened editor when the response arrives', async () => {
        response.deliver();
        await response.responded;

        await expect(component.getByTestId('opening-result')).toHaveText('opened');
        await expect(page.getByRole('dialog')).toBeVisible();
    });
});
