import React from 'react';

import {test} from '../../../playwright-components/core';

import {StatusLabelStories} from '../__stories__';

test('StatusLabel: AllStatusLabelStates', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.AllStatusLabelStates />);
    await expectScreenshot();
});

test('StatusLabel: AllNavigationFlowStates', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.AllNavigationFlowStates />);
    await expectScreenshot();
});

test('StatusLabel: WithPlaque', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.WithPlaque />);
    await expectScreenshot();
});

test('StatusLabel: WithCustomText', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.WithCustomText />);
    await expectScreenshot();
});

test('StatusLabel: WithoutIcon', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.WithoutIcon />);
    await expectScreenshot();
});

test('StatusLabel: IconStateOverride', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.IconStateOverride />);
    await expectScreenshot();
});

test('StatusLabel: StateOverride', async ({mount, expectScreenshot}) => {
    await mount(<StatusLabelStories.StateOverride />);
    await expectScreenshot();
});
