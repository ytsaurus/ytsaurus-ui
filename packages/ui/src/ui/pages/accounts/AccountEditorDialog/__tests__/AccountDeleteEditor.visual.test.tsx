import React from 'react';

import {expect, test} from '../../../../playwright-components/core';
import {AccountDeleteEditorStories} from '../__stories__/index';

test('AccountDeleteEditor: prevents deletion when resources are in use', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    const component = await mount(<AccountDeleteEditorStories.WithUsage />);

    const deleteButton = page.getByRole('button', {name: 'Delete'});
    await deleteButton.click();

    await expect(page.getByText(/following resources are still used/)).toBeVisible();
    await expect(page.getByRole('button', {name: 'Yes'})).toHaveCount(0);
    await expect(deleteButton).toBeDisabled();
    await expectScreenshot({component});
});
