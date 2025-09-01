import React from 'react';

import {test} from '../../../playwright-components/core';

import {NoContentStories} from '../__stories__';

test('NoContent: Default', async ({mount, expectScreenshot}) => {
    await mount(<NoContentStories.Default />);
    await expectScreenshot();
});

test('NoContent: WithAction', async ({mount, expectScreenshot}) => {
    await mount(<NoContentStories.WithAction />);
    await expectScreenshot();
});

test('NoContent: WithComplexHint', async ({mount, expectScreenshot}) => {
    await mount(<NoContentStories.WithComplexHint />);
    await expectScreenshot();
});

test('NoContent: WithCustomSize', async ({mount, expectScreenshot}) => {
    await mount(<NoContentStories.WithCustomSize />);
    await expectScreenshot();
});

test('NoContent: WithLargePadding', async ({mount, expectScreenshot}) => {
    await mount(<NoContentStories.WithLargePadding />);
    await expectScreenshot();
});
