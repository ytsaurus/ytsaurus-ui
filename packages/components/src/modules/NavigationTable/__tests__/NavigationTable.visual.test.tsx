import {expect, test} from '../../../../playwright-components/core';

import {NavigationTableVisualFixture} from './NavigationTableVisualFixture';
import {navigationTableWithDataVisualCases} from '../navigationTableStorySetup';

test.describe('NavigationTable', () => {
    test.describe.configure({timeout: 60_000});

    test('frozen YSON key', async ({mount, expectScreenshot, page}) => {
        await mount(<NavigationTableVisualFixture initialActiveTab="preview" withFrozenYsonKey />, {
            width: 720,
            rootStyle: {minHeight: 320},
        });
        const cell = page.locator('.yt-column-cell');
        await expect(cell).toContainText('queue');
        await cell.hover();
        await expect(cell).toContainText('42');
        await expectScreenshot();
    });

    test('empty', async ({mount, expectScreenshot, page}) => {
        await mount(<NavigationTableVisualFixture empty />, {
            width: 720,
            rootStyle: {minHeight: 320},
        });
        await page.locator('.navigation-table').waitFor({state: 'visible', timeout: 15_000});
        await expectScreenshot();
    });

    for (const {
        testTitle,
        initialActiveTab,
        withExtraColumns,
    } of navigationTableWithDataVisualCases) {
        test(testTitle, async ({mount, expectScreenshot, page}) => {
            await mount(
                <NavigationTableVisualFixture
                    initialActiveTab={initialActiveTab}
                    withExtraColumns={withExtraColumns}
                />,
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
