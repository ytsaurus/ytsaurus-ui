import React from 'react';

import {test} from '../../../../../../playwright-components/core';

import {FlowStateResultsStories} from '../__stories__';

test('FlowStateResults: Default', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Default />);
    await expectScreenshot();
});

test('FlowStateResults: Default with a hovered row', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.Default />);
    await page.locator('.yt-gravity-table__row').first().hover();
    await expectScreenshot();
});

test('FlowStateResults: NoResults', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.NoResults />);
    await expectScreenshot();
});

test('FlowStateResults: WithResponseErrors', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.WithResponseErrors />);
    await expectScreenshot();
});
