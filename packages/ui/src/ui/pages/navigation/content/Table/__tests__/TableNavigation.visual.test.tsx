import React from 'react';

import {expect, test} from '../../../../../playwright-components/core';
import {TableNavigationStories} from '../__stories__';

for (const theme of ['light', 'dark'] as const) {
    test(`Navigation table: clears the previous table while opening an empty table (${theme})`, async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<TableNavigationStories.EmptyTable />);
        const preview = page.getByRole('region', {name: 'Table preview'});
        await expect(preview).toContainText('source-value');

        await page.getByRole('button', {name: 'Open empty table', exact: true}).click();
        await expect(preview).not.toContainText('source-value');
        await expect(preview).not.toContainText('source_key');

        await page.getByRole('button', {name: 'Complete empty table read', exact: true}).click();
        await expect(preview).not.toContainText('source-value');
        await expectScreenshot({component: preview, themes: [theme]});
    });
}
