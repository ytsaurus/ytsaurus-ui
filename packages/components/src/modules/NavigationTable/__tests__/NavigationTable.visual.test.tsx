import {type ReactElement} from 'react';

import {YtComponentsConfigProvider} from '../../../context';
import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../../internal/Yson';
import {test} from '../../../playwright-components/core';

import {NavigationTable} from '../NavigationTable';
import {
    navigationTableSampleTable,
    navigationTableStoryEmptyMessage,
    navigationTableStoryFrameStyle,
    navigationTableStoryUnipikaForProvider,
    navigationTableWithDataVisualCases,
} from '../navigationTableStorySetup';

const navigationTableVisualTree = (node: ReactElement) => (
    <YtComponentsConfigProvider
        logError={() => undefined}
        unipika={navigationTableStoryUnipikaForProvider}
    >
        <div style={navigationTableStoryFrameStyle}>{node}</div>
    </YtComponentsConfigProvider>
);

test.describe('NavigationTable', () => {
    test.describe.configure({timeout: 60_000});

    test('empty', async ({mount, expectScreenshot, page}) => {
        await mount(
            navigationTableVisualTree(
                <NavigationTable
                    table={null}
                    emptyMessage={navigationTableStoryEmptyMessage}
                    ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                />,
            ),
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
                navigationTableVisualTree(
                    <NavigationTable
                        table={navigationTableSampleTable}
                        emptyMessage={navigationTableStoryEmptyMessage}
                        ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                        initialActiveTab={initialActiveTab}
                    />,
                ),
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
