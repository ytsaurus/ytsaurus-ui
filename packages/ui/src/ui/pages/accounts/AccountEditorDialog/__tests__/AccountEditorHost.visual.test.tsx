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
