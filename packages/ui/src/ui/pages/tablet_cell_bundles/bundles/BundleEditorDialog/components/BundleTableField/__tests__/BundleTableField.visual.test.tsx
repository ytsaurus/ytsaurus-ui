import React from 'react';

import {expect, test} from '../../../../../../../playwright-components/core';

import {BundleTableFieldStories} from '../__stories__';

test('BundleTableField: normal selected', async ({mount, expectScreenshot}) => {
    await mount(<BundleTableFieldStories.NormalSelected />);
    await expectScreenshot({nameSuffix: 'normal'});
});

test('BundleTableField: deprecated selected', async ({mount, expectScreenshot}) => {
    await mount(<BundleTableFieldStories.DeprecatedSelected />);
    await expectScreenshot({nameSuffix: 'deprecated'});
});

test('BundleTableField: deprecated selected without a reason', async ({
    mount,
    expectScreenshot,
}) => {
    await mount(<BundleTableFieldStories.DeprecatedWithoutReason />);
    await expectScreenshot({nameSuffix: 'deprecated-without-reason'});
});

test('BundleTableField: long type stays inside the type cell and has a complete tooltip', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await mount(<BundleTableFieldStories.NarrowLongType />);

    const typeCell = page
        .getByText('Deprecated configuration with a deliberately very long type name')
        .locator('xpath=ancestor::td');
    const warning = typeCell.locator('.yt-warning-icon');
    await expect(warning).toBeVisible();
    const typeCellBox = await typeCell.boundingBox();
    const warningBox = await warning.boundingBox();
    expect(typeCellBox).not.toBeNull();
    expect(warningBox).not.toBeNull();
    if (!typeCellBox || !warningBox) {
        throw new Error('The type cell and its warning must have layout boxes');
    }
    expect(warningBox.x + warningBox.width).toBeLessThanOrEqual(typeCellBox.x + typeCellBox.width);

    await typeCell.locator('.yt-tooltip_ellipsis').hover();
    await expect(
        page.getByText('This configuration is available only for existing bundles'),
    ).toBeVisible();
    await expectScreenshot({nameSuffix: 'long-type-tooltip'});
});

test('BundleTableField: warning follows selection without confirmation', async ({mount, page}) => {
    await mount(<BundleTableFieldStories.SelectionChange />);

    const normalRow = page.getByText('Normal configuration').locator('xpath=ancestor::tr');
    const deprecatedRow = page.getByText('Deprecated configuration').locator('xpath=ancestor::tr');
    await expect(normalRow.locator('.yt-warning-icon')).toHaveCount(0);
    await deprecatedRow.locator('input[type="radio"]').click();
    await expect(deprecatedRow.locator('.yt-warning-icon')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
});
