import React from 'react';
import {composeStories} from '@storybook/react';

import {expect, test} from '../../../../playwright-components/core';
import * as AccountEditorHostStoryComponents from '../__stories__/AccountEditorHost.stories';

const AccountEditorHostStories = composeStories(AccountEditorHostStoryComponents);

test('AccountEditorHost: opening blocks other edit buttons', async ({mount}) => {
    const component = await mount(<AccountEditorHostStories.Opening />);

    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
    await expect(component.getByRole('dialog')).toHaveCount(0);
});

test('AccountEditorHost: opens the dialog only after data is ready', async ({mount, page}) => {
    const component = await mount(<AccountEditorHostStories.Opened />);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeDisabled();
});

test('AccountEditorHost: enables edit buttons after a loading error', async ({mount}) => {
    const component = await mount(<AccountEditorHostStories.LoadError />);

    await expect(component.getByRole('button', {name: 'Edit account'})).toBeEnabled();
    await expect(component.getByRole('button', {name: 'Edit another'})).toBeEnabled();
    await expect(component.getByRole('dialog')).toHaveCount(0);
});

for (const action of ['Cancel', 'Unmount host']) {
    test(`AccountEditorHost: settles pending opening on ${action}`, async ({mount, page}) => {
        const component = await mount(<AccountEditorHostStories.OpeningLifecycle />);

        await component.getByRole('button', {name: 'Open', exact: true}).click();
        await expect(component.getByTestId('opening-result')).toHaveText('pending');
        await component.getByRole('button', {name: action, exact: true}).click();
        await expect(component.getByTestId('opening-result')).toHaveText('AbortError');

        await component.getByRole('button', {name: 'Deliver data'}).click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(component.getByTestId('opening-result')).toHaveText('AbortError');
    });
}
