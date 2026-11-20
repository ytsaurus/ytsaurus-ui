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
        for (const [column, value] of Object.entries({
            computation_id: '"enrich"',
            stream_id: '"input"',
            key: '["queue";[7;42]]',
            message_id: '"example-message-id"',
        })) {
            await expect(dialog.getByLabel(column, {exact: true})).toHaveValue(value);
        }
        await expectScreenshot({component: dialog, themes: [theme]});

        const keyInput = dialog.getByLabel('key', {exact: true});
        await keyInput.fill('["queue";[7;43]]');
        await expect(keyInput).toHaveValue('["queue";[7;43]]');
    });
}
