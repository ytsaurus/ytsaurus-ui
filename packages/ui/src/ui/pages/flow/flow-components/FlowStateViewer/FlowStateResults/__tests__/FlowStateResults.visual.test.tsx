import React from 'react';

import {test} from '../../../../../../playwright-components/core';

import {FlowStateResultsStories} from '../__stories__';

test('FlowStateResults: Populated', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Populated />);
    await expectScreenshot();
});

test('FlowStateResults: Populated with a hovered row', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    await page.locator('.yt-gravity-table__row').first().hover();
    await expectScreenshot();
});

test('FlowStateResults: No scope', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.NoScope />);
    await expectScreenshot();
});

test('FlowStateResults: Loading', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Loading />);
    await expectScreenshot();
});

test('FlowStateResults: Refreshing', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Refreshing />);
    await expectScreenshot();
});

test('FlowStateResults: Successful empty response', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.SuccessfulEmpty />);
    await expectScreenshot();
});

test('FlowStateResults: Transport error', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.TransportError />);
    await expectScreenshot();
});

test('FlowStateResults: Response error', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.ResponseError />);
    await expectScreenshot();
});

test('FlowStateResults: Narrow long content', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.NarrowLongContent />, {width: 480});
    await expectScreenshot();
});
