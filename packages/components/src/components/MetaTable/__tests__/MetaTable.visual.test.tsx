import {test} from '../../../../playwright-components/core';

import {MetaTable} from '../MetaTable';
import {
    metaTableStoryConfigs,
    metaTableStoryFrameStyle,
    metaTableVisualCaseOrder,
} from '../metaTableStorySetup';

for (const example of metaTableVisualCaseOrder) {
    test(`MetaTable: ${example}`, async ({mount, expectScreenshot}) => {
        await mount(
            <div style={metaTableStoryFrameStyle}>
                <MetaTable {...metaTableStoryConfigs[example]} />
            </div>,
        );
        await expectScreenshot();
    });
}
