import React from 'react';
import {type Page, type Request, type Route} from '@playwright/test';

import {expect, test} from '../../../../playwright-components/core';
import {AccountEditorHostStories} from '../__stories__/index';

const ACCOUNT_NAME = 'account';

interface AccountState {
    diskSpaceLimit: number;
    parentName: string;
    resourceUsage?: number;
}

const CORS_HEADERS = {
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-origin': '*',
};
const GET_API_PATTERN = /\/api\/v4\/get(?:\?.*)?$/;

async function fulfillPreflight(route: Route) {
    if (route.request().method() !== 'OPTIONS') {
        return false;
    }

    await route.fulfill({status: 204, headers: CORS_HEADERS});
    return true;
}

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

function makeAccountNode(parentName: string, diskSpaceLimit: number, resourceUsage = 2) {
    return {
        $attributes: {
            abc: {},
            parent_name: parentName,
            resource_limits: {
                disk_space_per_medium: {default: diskSpaceLimit},
                node_count: 10,
            },
            resource_usage: {
                disk_space_per_medium: {default: resourceUsage},
                node_count: resourceUsage,
            },
            recursive_resource_usage: {
                disk_space_per_medium: {default: resourceUsage},
                node_count: resourceUsage,
            },
            committed_resource_usage: {
                disk_space_per_medium: {default: resourceUsage},
                node_count: resourceUsage,
            },
            recursive_committed_resource_usage: {
                disk_space_per_medium: {default: resourceUsage},
                node_count: resourceUsage,
            },
            total_children_resource_limits: {
                disk_space_per_medium: {default: 0},
                node_count: 0,
            },
        },
        $value: {},
    };
}

async function mockAccountEditorData(
    page: Page,
    getState: () => AccountState,
    requestedPaths: Array<string> = [],
) {
    await page.route(GET_API_PATTERN, async (route) => {
        if (await fulfillPreflight(route)) {
            return;
        }

        const parameters = await readParameters(route.request());
        const path = parameters.path || '';
        if (!path) {
            await route.fulfill({headers: CORS_HEADERS, json: {value: null}});
            return;
        }
        requestedPaths.push(path);

        const state = getState();
        const topLevel = state.parentName === 'root' ? ACCOUNT_NAME : state.parentName;
        if (path === `//sys/accounts/${ACCOUNT_NAME}/@path`) {
            const suffix = topLevel === ACCOUNT_NAME ? '' : `/${ACCOUNT_NAME}`;
            await route.fulfill({
                headers: CORS_HEADERS,
                json: {value: `//sys/account_tree/${topLevel}${suffix}`},
            });
            return;
        }
        if (path === `//sys/account_tree/${topLevel}`) {
            const account = makeAccountNode(
                state.parentName,
                state.diskSpaceLimit,
                state.resourceUsage,
            );
            const value =
                topLevel === ACCOUNT_NAME
                    ? account
                    : {
                          ...makeAccountNode('root', 100),
                          $value: {[ACCOUNT_NAME]: account},
                      };
            await route.fulfill({headers: CORS_HEADERS, json: {value}});
            return;
        }

        await route.fulfill({status: 404, json: {message: `Unexpected path: ${path}`}});
    });
}

test('AccountEditorHost: opening blocks other edit buttons', async ({mount}) => {
    const component = await mount(<AccountEditorHostStories.Opening />);

    await expect(component.getByRole('button', {name: 'Edit account'})).toHaveClass(
        /g-button_loading/,
    );
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
    await expect(component.getByRole('button', {name: 'Edit root'})).toBeDisabled();
    await expect(component.getByRole('dialog')).toHaveCount(0);
});

test('AccountEditorHost: loads account data and opens the dialog', async ({mount, page}) => {
    const requestedPaths: Array<string> = [];
    const state = {diskSpaceLimit: 10, parentName: 'root'};
    await mockAccountEditorData(page, () => state, requestedPaths);

    const component = await mount(<AccountEditorHostStories.LoadedThroughApi />);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
    expect(requestedPaths).toEqual(['//sys/accounts/account/@path', '//sys/account_tree/account']);
});

test('AccountEditorHost: disables ABC and Parent for a regular user', async ({mount, page}) => {
    const accountNamesRequests: Array<string> = [];
    page.on('request', (request) => {
        if (request.url().includes('/api/v3/list')) {
            accountNamesRequests.push(request.url());
        }
    });

    await mount(<AccountEditorHostStories.Opened />);

    await expect(page.getByRole('button', {name: 'Select ABC service...'})).toBeDisabled();
    await expect(page.getByRole('button', {name: 'root', exact: true})).toBeDisabled();
    expect(accountNamesRequests).toHaveLength(0);
});

test('AccountEditorHost: enables ABC and Parent for an administrator', async ({mount, page}) => {
    await page.route('**/api/v3/list**', async (route) => {
        await route.fulfill({json: ['parent', 'sibling']});
    });

    await mount(<AccountEditorHostStories.OpenedAsAdmin />);

    await expect(page.getByRole('button', {name: 'Select ABC service...'})).toBeEnabled();
    await expect(page.getByRole('button', {name: '<Root>', exact: true})).toBeEnabled();
    await page.getByRole('button', {name: '<Root>', exact: true}).click();
    await expect(page.getByText('parent', {exact: true})).toBeVisible();
    await expect(page.getByText('sibling', {exact: true})).toBeVisible();
});

test('AccountEditorHost: reports a loading error and enables edit buttons', async ({
    mount,
    page,
}) => {
    await page.route(GET_API_PATTERN, async (route) => {
        if (await fulfillPreflight(route)) {
            return;
        }
        const parameters = await readParameters(route.request());
        if (!parameters.path) {
            await route.fulfill({headers: CORS_HEADERS, json: {value: null}});
            return;
        }
        await route.fulfill({
            status: 500,
            headers: CORS_HEADERS,
            json: {message: 'Failed to load account'},
        });
    });
    const component = await mount(<AccountEditorHostStories.LoadedThroughApi />);

    await expect(page.getByText('Failed to load account account')).toBeVisible();
    await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeEnabled();
    await expect(component.getByRole('dialog')).toHaveCount(0);
});

test('AccountEditorHost: updates Parent and refreshes the open dialog', async ({mount, page}) => {
    const state = {diskSpaceLimit: 10, parentName: 'root'};
    await mockAccountEditorData(page, () => state);
    await page.route('**/api/v3/list**', async (route) => {
        await route.fulfill({json: ['other-top-level']});
    });
    await page.route('**/api/v3/set**', async (route) => {
        state.parentName = 'other-top-level';
        await route.fulfill({json: null});
    });

    const component = await mount(<AccountEditorHostStories.LoadedThroughApiAsAdmin />);

    await page.getByRole('button', {name: '<Root>', exact: true}).click();
    const requestPromise = page.waitForRequest('**/api/v3/set**');
    await page.getByText('other-top-level', {exact: true}).click();
    const request = await requestPromise;

    expect(await readParameters(request)).toEqual({
        path: '//sys/accounts/account/@parent_name',
    });
    expect(request.postDataJSON()).toBe('other-top-level');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', {name: 'other-top-level', exact: true})).toBeEnabled();
    await expect(component.getByTestId('editor-events')).toContainText('parent');
});

test('AccountEditorHost: updates a resource and refreshes the open dialog', async ({
    mount,
    page,
}) => {
    const state = {diskSpaceLimit: 10, parentName: 'root'};
    await mockAccountEditorData(page, () => state);
    await page.route('**/api/v3/set**', async (route) => {
        state.diskSpaceLimit = 12;
        await route.fulfill({json: null});
    });

    const component = await mount(<AccountEditorHostStories.LoadedThroughApiAsAdmin />);

    await page.locator('.account-editor-dialog__sidebar').getByText('Disk space').click();
    await page.locator('.account-quota__edit').click();
    await page.getByTestId('quota-editor-new-limit').locator('input').fill('12');
    await page.getByTestId('quota-editor-save').click();
    const requestPromise = page.waitForRequest('**/api/v3/set**');
    await page.getByTestId('quota-editor-confirmation-yes').click();
    const request = await requestPromise;

    expect(await readParameters(request)).toEqual({
        path: '//sys/accounts/account/@resource_limits/disk_space_per_medium/default',
    });
    expect(request.postDataJSON()).toBe(12);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.account-quota__progress').first()).toContainText('12 B');
    await expect(component.getByTestId('editor-events')).toContainText('quota');
});

test('AccountEditorHost: keeps the deleted state open until the user closes it', async ({
    mount,
    page,
}) => {
    const state = {diskSpaceLimit: 10, parentName: 'root', resourceUsage: 0};
    await mockAccountEditorData(page, () => state);
    await page.route('**/api/v3/remove**', async (route) => {
        await route.fulfill({json: null});
    });

    const component = await mount(<AccountEditorHostStories.LoadedThroughApi />);

    await page.locator('.account-editor-dialog__sidebar').getByText('Delete').click();
    await page.getByTitle('Delete').click();
    const requestPromise = page.waitForRequest('**/api/v3/remove**');
    await page.getByRole('button', {name: 'Yes'}).click();
    const request = await requestPromise;

    expect(await readParameters(request)).toEqual({path: '//sys/accounts/account'});
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Account account has been deleted')).toBeVisible();
    await expect(component.getByTestId('editor-events')).toContainText('deleted:account');

    await page.getByRole('dialog').getByRole('button', {name: 'Close'}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
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

    await mount(<AccountEditorHostStories.OpenedAsAdmin />);

    await page.getByRole('button', {name: '<Root>', exact: true}).click();
    const requestPromise = page.waitForRequest('**/api/v3/set**');
    const responsePromise = page.waitForResponse('**/api/v3/set**');
    await page.getByText('other-top-level', {exact: true}).click();
    await requestPromise;

    await expect(page.getByRole('button', {name: 'root', exact: true})).toBeDisabled();
    resolveMutation?.();
    await responsePromise;

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', {name: '<Root>', exact: true})).toBeEnabled();
});
