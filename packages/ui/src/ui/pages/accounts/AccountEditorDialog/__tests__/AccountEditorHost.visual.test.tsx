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
