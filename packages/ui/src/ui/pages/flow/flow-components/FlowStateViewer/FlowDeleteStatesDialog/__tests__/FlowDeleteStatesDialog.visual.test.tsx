import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';
import {PendingDelete} from '../__stories__/FlowDeleteStatesDialog.stories';
import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog';

const row = {
    section: 'key_state' as const,
    computationId: 'checkout-attribution',
    key: ['4506162232340681623', 'checkout'],
    stateName: '/counter',
    value: {events: 7},
};

test('FlowDeleteStatesDialog: uses the standard single-submit dialog', async ({mount, page}) => {
    await page.route('**/api/v4/get_pipeline_state**', async (route) => {
        await route.fulfill({contentType: 'application/json', body: '"Stopped"'});
    });
    await mount(
        <FlowDeleteStatesDialog
            visible
            onClose={() => {}}
            pipeline_path="//pipeline"
            rows={[row]}
            permission={{
                data: {action: 'allow'},
                refetch: () => ({unwrap: async () => ({action: 'allow'})}),
            }}
            onCommitted={() => {}}
        />,
    );

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Delete states');
    await expect(dialog.getByRole('table')).toBeVisible();
    await expect(dialog.getByRole('button', {name: 'Delete'})).toBeEnabled();
    await expect(dialog.getByRole('button', {name: 'Cancel'})).toBeVisible();
});

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
    const deleteButton = dialog.locator('.g-dialog-footer__button-apply');
    const cancelButton = dialog.getByRole('button', {name: 'Cancel'});
    await dialog.getByRole('checkbox').check();
    await expect(deleteButton).toBeEnabled();
    await deleteButton.evaluate((button: HTMLButtonElement) => button.click());

    await expect(deleteButton).toHaveClass(/g-button_loading/);
    await expect(cancelButton).toBeDisabled();
    await expect(dialog.getByRole('checkbox')).toBeVisible();
    await expect(dialog.locator('.g-loader')).toHaveCount(0);
    await expectScreenshot({component: dialog});
});
