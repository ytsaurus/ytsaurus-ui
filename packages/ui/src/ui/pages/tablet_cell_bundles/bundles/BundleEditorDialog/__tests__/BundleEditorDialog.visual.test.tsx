import React from 'react';

import {test} from '../../../../../playwright-components/core';

import {BundleEditorDialogStories} from '../__stories__';

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
        .getByRole('row')
        .filter({has: page.getByText('rpc-legacy', {exact: true})})
        .getByRole('radio')
        .click();
    await dialog
        .getByRole('row')
        .filter({
            has: page.getByText('node-legacy-with-an-intentionally-long-configuration-name', {
                exact: true,
            }),
        })
        .getByRole('radio')
        .click();
    await dialog
        .getByTestId(
            'bundle-table-field-type-node-legacy-with-an-intentionally-long-configuration-name',
        )
        .hover();
    await page.getByText('Migrate this bundle to node-small').waitFor({state: 'visible'});
    await expectScreenshot({component: dialog, nameSuffix: 'deprecated-tooltip'});
});
