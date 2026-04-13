import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../../internal/Yson';
import {test} from '../../../playwright-components/core';

import {NavigationTable} from '../NavigationTable';
import {
    navigationTableSampleTable,
    navigationTableStoryEmptyMessage,
    navigationTableStoryFrameStyle,
    navigationTableWithDataVisualCases,
} from '../navigationTableStorySetup';

test.describe('NavigationTable', () => {
    test.describe.configure({timeout: 60_000});

    test('empty', async ({mount, expectScreenshot, page}) => {
        await mount(
            <div style={navigationTableStoryFrameStyle}>
                <NavigationTable
                    table={null}
                    emptyMessage={navigationTableStoryEmptyMessage}
                    ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                    logError={() => undefined}
                />
            </div>,
            {
                width: 720,
                rootStyle: {minHeight: 320},
            },
        );
        await page.locator('.navigation-table').waitFor({state: 'visible', timeout: 15_000});
        await expectScreenshot();
    });

    for (const {testTitle, initialActiveTab} of navigationTableWithDataVisualCases) {
        test(testTitle, async ({mount, expectScreenshot, page}) => {
            await mount(
                <div style={navigationTableStoryFrameStyle}>
                    <NavigationTable
                        table={navigationTableSampleTable}
                        emptyMessage={navigationTableStoryEmptyMessage}
                        ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                        initialActiveTab={initialActiveTab}
                    />
                </div>,
                {
                    width: 720,
                    rootStyle: {minHeight: 320},
                },
            );
            await page.locator('.navigation-table').waitFor({state: 'visible', timeout: 15_000});
            await expectScreenshot();
        });
    }
});
