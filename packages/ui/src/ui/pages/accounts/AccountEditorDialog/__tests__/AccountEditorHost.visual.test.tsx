import React from 'react';

import {expect, test} from '../../../../playwright-components/core';
import {AccountEditorHostStories} from '../__stories__';

test('AccountEditorHost: opening blocks other edit buttons', async ({mount}) => {
    const component = await mount(<AccountEditorHostStories.Opening />);

    await expect(component.getByRole('button', {name: 'Edit account'})).toHaveClass(
        /g-button_loading/,
    );
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
    await expect(component.getByRole('button', {name: 'Edit root'})).toBeDisabled();
    await expect(component.getByRole('dialog')).toHaveCount(0);
});

test('AccountEditorHost: opens the dialog only after data is ready', async ({mount, page}) => {
    const component = await mount(<AccountEditorHostStories.Opened />);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
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
    const component = await mount(<AccountEditorHostStories.LoadError />);

    await expect(page.getByText('Failed to load account account')).toBeVisible();
    await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeEnabled();
    await expect(component.getByRole('dialog')).toHaveCount(0);
});

test('AccountEditorHost: keeps the dialog open after changing Parent', async ({mount, page}) => {
    await page.route('**/api/v3/list**', async (route) => {
        await route.fulfill({json: ['other-top-level']});
    });
    await page.route('**/api/v3/set**', async (route) => {
        await route.fulfill({json: null});
    });

    await mount(<AccountEditorHostStories.OpenedAsAdmin />);

    await page.getByRole('button', {name: '<Root>', exact: true}).click();
    const requestPromise = page.waitForRequest('**/api/v3/set**');
    await page.getByText('other-top-level', {exact: true}).click();
    await requestPromise;

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', {name: '<Root>', exact: true})).toBeEnabled();
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
