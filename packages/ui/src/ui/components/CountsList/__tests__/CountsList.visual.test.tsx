import React from 'react';

import {test} from '../../../playwright-components/core';

import {CountsListStories} from '../__stories__';

test('CountsList: Default', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.Default />);
    await expectScreenshot();
});

test('CountsList: WithHiddenAll', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.WithHiddenAll />);
    await expectScreenshot();
});

test('CountsList: WithSelectedItems', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.WithSelectedItems />);
    await expectScreenshot();
});

test('CountsList: WithSelectedItemsAndActions', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.WithSelectedItemsAndActions />);
    await expectScreenshot();
});

test('CountsList: LargeDataset', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.LargeList />);
    await expectScreenshot();
});

test('CountsList: EmptyList', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.EmptyList />);
    await expectScreenshot();
});

test('CountsList: SingleItem', async ({mount, expectScreenshot}) => {
    await mount(<CountsListStories.SingleItem />);
    await expectScreenshot();
});
