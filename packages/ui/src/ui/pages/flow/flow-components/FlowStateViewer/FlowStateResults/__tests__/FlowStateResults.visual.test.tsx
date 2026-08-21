import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

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

test('FlowStateResults: Value copy is keyboard reachable', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const copy = page.getByRole('button', {name: 'Copy value'}).first();

    await copy.focus();

    await expect(copy).toBeFocused();
});

test('FlowStateResults: Narrow delete remains keyboard reachable', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.NarrowLongContent />, {width: 480});
    const deleteButton = page.getByRole('button', {name: 'Delete state row'});

    await expect(deleteButton).toBeInViewport();
    await deleteButton.focus();
    await expect(deleteButton).toBeFocused();
    await deleteButton.press('Enter');
});

test('FlowStateResults: Refreshing rows are inert', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Refreshing />);
    const content = page.locator('[data-testid="results-content"]');
    const deleteButton = page.getByRole('button', {name: 'Delete state row'}).first();

    await expect(content).toHaveAttribute('inert', '');
    await deleteButton.focus();
    await expect(deleteButton).not.toBeFocused();
});
