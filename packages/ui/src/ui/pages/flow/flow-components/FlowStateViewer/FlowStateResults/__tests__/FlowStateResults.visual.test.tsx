import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateResultsStories} from '../__stories__';

test('FlowStateResults: Populated', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Populated />);
    await expectScreenshot();
});

test('FlowStateResults: Populated with a hovered row', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    await page.locator('.yt-gravity-table__row').nth(1).hover();
    await expectScreenshot();
});

test('FlowStateResults: Read only', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.ReadOnly />);
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

test('FlowStateResults: row actions reveal on hover and keyboard focus', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const row = page.locator('.yt-gravity-table__row').nth(1);
    const actions = row.locator('.yt-flow-state-results__hover-action');

    await expect(actions.first()).toHaveCSS('opacity', '0');
    await expect(actions.first()).toHaveCSS('pointer-events', 'none');
    await row.hover();
    await expect(actions.first()).toHaveCSS('opacity', '1');
    await expect(actions.first()).toHaveCSS('pointer-events', 'auto');
    await page.mouse.move(0, 0);
    await row.getByRole('button', {name: 'Show value'}).focus();
    await expect(actions.first()).toHaveCSS('opacity', '1');
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
    const selectedRowId = 'key_state|state||["4506162232340681623","checkout"]|/counter';
    await mount(<FlowStateResultsStories.Refreshing rowSelection={{[selectedRowId]: true}} />);
    const content = page.locator('[data-testid="results-content"]');
    const deleteButton = page.getByRole('button', {name: 'Delete state row'}).first();
    const bulkDeleteButton = page.getByRole('button', {name: 'Delete', exact: true});
    const rawResponseButton = page.getByRole('button', {name: 'Show raw response'});
    const status = page.getByRole('status');

    await expect(content).toHaveAttribute('inert', '');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    expect(
        await content.evaluate((node) => !node.contains(document.querySelector('[role="status"]'))),
    ).toBe(true);
    for (const action of [bulkDeleteButton, deleteButton, rawResponseButton]) {
        await action.focus();
        await expect(action).not.toBeFocused();
        await expect(action.click({timeout: 500})).rejects.toThrow();
    }
});
