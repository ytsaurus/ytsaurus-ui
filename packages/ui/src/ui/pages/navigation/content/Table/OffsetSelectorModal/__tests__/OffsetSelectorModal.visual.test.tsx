import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';
import {OffsetSelectorModalStories} from '../__stories__';

for (const theme of ['light', 'dark'] as const) {
    test(`OffsetSelectorModal: opens with a frozen composite YSON key (${theme})`, async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<OffsetSelectorModalStories.FrozenYsonKey />);

        await expect(page.locator('.data-table-wrapper')).toContainText('queue');
        const dialog = page.getByRole('dialog');
        for (const column of ['computation_id', 'stream_id', 'key', 'message_id']) {
            await expect(dialog.getByLabel(column, {exact: true})).toBeVisible();
        }
        await expectScreenshot({component: dialog, themes: [theme]});
    });
}
