import React from 'react';

import {expect, test} from '../../../../playwright-components/core';
import {AccountDeleteEditorStories} from '../__stories__';

test('AccountDeleteEditor: asks for confirmation before deletion', async ({mount, page}) => {
    await mount(<AccountDeleteEditorStories.Empty />);

    await page.getByRole('button', {name: 'Delete'}).click();

    await expect(page.getByText('Delete account account')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Yes'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Cancel'})).toBeVisible();
});

test('AccountDeleteEditor: prevents deletion when resources are in use', async ({mount, page}) => {
    await mount(<AccountDeleteEditorStories.WithUsage />);

    const deleteButton = page.getByRole('button', {name: 'Delete'});
    await deleteButton.click();

    await expect(page.getByText(/following resources are still used/)).toBeVisible();
    await expect(page.getByText('node_count', {exact: true})).toBeVisible();
    await expect(page.getByText('disk_space_per_medium/default', {exact: true})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Yes'})).toHaveCount(0);
    await expect(deleteButton).toBeDisabled();
});
