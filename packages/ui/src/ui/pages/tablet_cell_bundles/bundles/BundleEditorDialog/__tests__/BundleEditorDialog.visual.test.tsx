import React from 'react';

import {expect, test} from '../../../../../playwright-components/core';

import {BundleEditorDialogStories} from '../__stories__';

test('BundleEditorDialog: deprecated configurations flow through the real Resources form', async ({
    mount,
    page,
}) => {
    await mount(<BundleEditorDialogStories.Default />);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('listitem').filter({hasText: 'Resources'}).click();
    const deprecatedRpcRow = dialog
        .getByText('rpc-legacy', {exact: true})
        .locator('xpath=ancestor::tr');
    const deprecatedNodeRow = dialog
        .getByText('node-legacy-with-an-intentionally-long-configuration-name', {exact: true})
        .locator('xpath=ancestor::tr');
    const secondaryColor = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.style.color = 'var(--g-color-text-secondary)';
        document.body.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
    });
    await expect(deprecatedRpcRow.getByText('rpc-legacy', {exact: true})).toHaveCSS(
        'color',
        secondaryColor,
    );
    await expect(
        deprecatedNodeRow.getByText('node-legacy-with-an-intentionally-long-configuration-name', {
            exact: true,
        }),
    ).toHaveCSS('color', secondaryColor);

    await deprecatedRpcRow.locator('input[type="radio"]').click();
    await expect(deprecatedRpcRow.locator('.yt-warning-icon')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(1);

    await deprecatedNodeRow.locator('.yt-tooltip_ellipsis').hover();
    await expect(page.getByText('Migrate this bundle to node-small')).toBeVisible();

    const noReasonType = dialog.getByText('rpc-legacy-without-a-reason', {exact: true});
    await noReasonType.hover();
    await expect(page.getByText('Marked as deprecated', {exact: true})).toBeVisible();

    await deprecatedNodeRow.locator('input[type="radio"]').click();
    await dialog.getByRole('listitem').filter({hasText: 'Memory'}).click();
    const reservedInput = dialog
        .getByText('Reserved', {exact: true})
        .locator('xpath=following::input[1]');
    await expect(reservedInput).toHaveValue('6.52 GiB');

    await dialog.getByRole('listitem').filter({hasText: 'Thread pools'}).click();
    await dialog.getByRole('button', {name: 'Reset to default'}).click();
    const queryPoolInput = dialog
        .getByText('Query thread pool size', {exact: true})
        .locator('xpath=following::input[1]');
    await expect(queryPoolInput).toHaveValue('12');
});

test('BundleEditorDialog: initial Resources view', async ({mount, page, expectScreenshot}) => {
    await mount(<BundleEditorDialogStories.Default />);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('listitem').filter({hasText: 'Resources'}).click();
    await expectScreenshot({component: dialog, nameSuffix: 'resources-initial'});
});

test('BundleEditorDialog: selected deprecated configurations with tooltip', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await mount(<BundleEditorDialogStories.Default />);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('listitem').filter({hasText: 'Resources'}).click();
    await dialog
        .getByText('rpc-legacy', {exact: true})
        .locator('xpath=ancestor::tr')
        .locator('input[type="radio"]')
        .click();
    await dialog
        .getByText('node-legacy-with-an-intentionally-long-configuration-name', {exact: true})
        .locator('xpath=ancestor::tr')
        .locator('input[type="radio"]')
        .click();
    await dialog
        .getByText('node-legacy-with-an-intentionally-long-configuration-name', {exact: true})
        .locator('xpath=ancestor::tr')
        .locator('.yt-tooltip_ellipsis')
        .hover();
    await expect(page.getByText('Migrate this bundle to node-small')).toBeVisible();
    await expectScreenshot({component: dialog, nameSuffix: 'deprecated-tooltip'});
});
