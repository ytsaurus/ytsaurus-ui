import React from 'react';

import {test} from '../../../playwright-components/core';

import {BlockStories} from '../__stories__';

test('YTErrorBlock: Default', async ({mount, expectScreenshot}) => {
    await mount(<BlockStories.Default />);
    await expectScreenshot();
});

test('YTErrorBlock: WithErrorObject', async ({mount, expectScreenshot}) => {
    await mount(<BlockStories.WithErrorObject />);
    await expectScreenshot();
});

test('YTErrorBlock: CompactView', async ({mount, expectScreenshot}) => {
    await mount(<BlockStories.CompactView />);
    await expectScreenshot();
});
