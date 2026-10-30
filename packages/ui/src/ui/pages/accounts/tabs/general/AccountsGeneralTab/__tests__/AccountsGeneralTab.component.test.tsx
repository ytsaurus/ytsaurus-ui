import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';
import {Tree} from '../__stories__/AccountsGeneralTab.stories';
import {createAccountsMock, makeAccount} from '../__stories__/mocks';

test.setTimeout(30_000);

test.beforeEach(async ({router}) => {
    await router.use(...createAccountsMock().handlers);
});

for (const mode of ['all', 'usable', 'favourites'] as const) {
    test(`AccountsGeneralTab: initial expansion in ${mode}`, async ({mount}) => {
        const component = await mount(<Tree initialMode={mode} />);

        await expect(component.getByRole('link', {name: 'parent', exact: true})).toBeVisible();
        const child = component.getByRole('link', {name: 'child', exact: true});
        if (mode === 'all') {
            await expect(child).toBeHidden();
        } else {
            await expect(child).toBeVisible();
        }
    });
}

test('AccountsGeneralTab: keeps collapsed branches across refresh and filtered modes', async ({
    mount,
    router,
}) => {
    const api = createAccountsMock();
    await router.use(...api.handlers);
    const component = await mount(<Tree />);
    const child = component.getByRole('link', {name: 'child', exact: true});

    await test.step('Collapse the parent manually', async () => {
        await expect(child).toBeVisible();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeHidden();
    });

    await test.step('Refresh preserves the parent and expands a new branch', async () => {
        api.accounts.push(makeAccount('new-parent'), makeAccount('new-child', 'new-parent'));
        api.usable.push('new-child');
        await component.getByRole('button', {name: 'Refresh accounts'}).click();
        await expect(component.getByRole('link', {name: 'new-child', exact: true})).toBeVisible();
        await expect(child).toBeHidden();
    });

    await test.step('Switch to Favourites without resetting shared branches', async () => {
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(component.getByRole('radio', {name: 'Favourites', exact: true})).toBeChecked();
        await expect(child).toBeHidden();
        await expect(component.getByRole('link', {name: 'new-child', exact: true})).toBeHidden();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeVisible();
        await expect(component.getByRole('link', {name: 'usable-only', exact: true})).toBeHidden();
    });
});

test('AccountsGeneralTab: resets expansion when switching through All on Dashboard', async ({
    mount,
}) => {
    const component = await mount(<Tree viewContext="dashboard" />);
    const child = component.getByRole('link', {name: 'child', exact: true});

    await test.step('Collapse a branch in Usable', async () => {
        await expect(child).toBeVisible();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeHidden();
    });

    await test.step('All starts collapsed and supports manual expansion', async () => {
        await component.getByRole('radio', {name: 'All', exact: true}).check();
        await expect(child).toBeHidden();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeVisible();
    });

    await test.step('Returning to Usable restores the expanded default', async () => {
        await component.getByRole('radio', {name: 'Usable', exact: true}).check();
        await expect(child).toBeVisible();
        await component.getByTestId('account-tree-toggle-parent').click();
        await expect(child).toBeHidden();
        await component.getByRole('radio', {name: 'All', exact: true}).check();
        await expect(child).toBeHidden();
        await component.getByRole('radio', {name: 'Favourites', exact: true}).check();
        await expect(child).toBeVisible();
    });
});

test('AccountsGeneralTab: keeps the selected account expanded in All', async ({mount}) => {
    const component = await mount(<Tree initialMode="all" activeAccount="parent" />);

    await expect(component.getByRole('link', {name: 'child', exact: true})).toBeVisible();
});
