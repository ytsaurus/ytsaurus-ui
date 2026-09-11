import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';
import {PendingDelete} from '../__stories__/FlowDeleteStatesDialog.stories';
test('FlowDeleteStatesDialog: keeps progress in the footer while deletion is pending', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await page.route('**/api/v4/get_pipeline_state**', async (route) => {
        await route.fulfill({contentType: 'application/json', body: '"Paused"'});
    });
    await mount(<PendingDelete />);

    const dialog = page.getByRole('dialog');
    const deleteButton = dialog.getByRole('button', {name: 'Delete', exact: true});
    const cancelButton = dialog.getByRole('button', {name: 'Cancel'});
    await dialog.getByRole('checkbox').check();
    await expect(deleteButton).toBeEnabled();
    await deleteButton.click();

    await expect(cancelButton).toBeDisabled();
    await expect(dialog.getByRole('checkbox')).toBeVisible();
    await expectScreenshot({component: dialog});
});
