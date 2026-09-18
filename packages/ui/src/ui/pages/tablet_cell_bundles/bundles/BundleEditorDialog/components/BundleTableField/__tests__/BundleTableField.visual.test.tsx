import React from 'react';

import {test} from '../../../../../../../playwright-components/core';

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
    page,
    expectScreenshot,
}) => {
    await mount(<BundleTableFieldStories.DeprecatedWithoutReason />);
    await page.getByText('Deprecated without reason').hover();
    await page.getByText('Marked as deprecated', {exact: true}).waitFor({state: 'visible'});
    await expectScreenshot({nameSuffix: 'deprecated-without-reason'});
});

test('BundleTableField: long type stays inside the type cell and has a complete tooltip', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await mount(<BundleTableFieldStories.NarrowLongType />);

    await page.getByTestId('bundle-table-field-type-long-deprecated').hover();
    await page
        .getByText('This configuration is available only for existing bundles')
        .waitFor({state: 'visible'});
    await expectScreenshot({nameSuffix: 'long-type-tooltip'});
});
