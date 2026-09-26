import React from 'react';

import {expect, test} from '../../../../playwright-components/core';

import {FlowStatusToolbarStories} from '../__stories__';
import {makeFlowStatusHandlers, makeFlowStatusMock} from '../__stories__/mocks';

test('FlowStatusToolbar: stop stays disabled until the pipeline is stopped', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    // The controller keeps reporting Working right after stop-pipeline, before Draining starts.
    await router.use(...makeFlowStatusHandlers('Working'));
    await mount(<FlowStatusToolbarStories.Working />);

    const stop = page.getByRole('button', {name: 'Stop'});
    await expect(stop).toBeEnabled();
    await stop.click();
    await expect(stop).toBeDisabled();
    await expect(stop).toHaveText('Stopping');
    await expect(stop.locator('.g-spin')).toBeVisible();
    await expectScreenshot();
});

test('FlowStatusToolbar: stop is disabled while draining', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(...makeFlowStatusHandlers('Draining'));
    await mount(<FlowStatusToolbarStories.Draining />);

    await expect(page.getByRole('button', {name: 'Start'})).toBeEnabled();
    const stop = page.getByRole('button', {name: 'Stop'});
    await expect(stop).toBeDisabled();
    await expect(stop).toHaveText('Stopping');
    await expectScreenshot();
});

test('FlowStatusToolbar: stop is enabled again once stopped', async ({mount, page, router}) => {
    const mock = makeFlowStatusMock('Working', {transitions: {stop: 'Stopped'}, holdActions: true});
    await router.use(...mock.handlers);
    await mount(<FlowStatusToolbarStories.Working />);

    const stop = page.getByRole('button', {name: 'Stop'});
    await stop.click();
    await expect(stop).toBeDisabled();
    expect(mock.calls).toEqual(['stop']);

    // The pipeline reaches Stopped and the status is reloaded right after the stop request.
    mock.releaseActions();
    await expect(stop).toBeEnabled();
    await expect(stop).toHaveText('Stop');
});

test('FlowStatusToolbar: pause stays disabled until the pipeline is paused', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(...makeFlowStatusHandlers('Working'));
    await mount(<FlowStatusToolbarStories.Working />);

    const pause = page.getByRole('button', {name: /^Paus/});
    await pause.click();
    await expect(pause).toBeDisabled();
    await expect(pause).toHaveText('Pausing');
    await expect(page.getByRole('button', {name: 'Stop'})).toBeEnabled();
    await expectScreenshot();
});

test('FlowStatusToolbar: pause is disabled while pausing', async ({mount, page, router}) => {
    await router.use(...makeFlowStatusHandlers('Pausing'));
    await mount(<FlowStatusToolbarStories.Pausing />);

    const pause = page.getByRole('button', {name: /^Paus/});
    await expect(pause).toBeDisabled();
    await expect(pause).toHaveText('Pausing');
});

test('FlowStatusToolbar: start stays disabled until the pipeline is working', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(...makeFlowStatusHandlers('Stopped'));
    await mount(<FlowStatusToolbarStories.Stopped />);

    const start = page.getByRole('button', {name: 'Start'});
    await start.click();
    await expect(start).toBeDisabled();
    await expect(start).toHaveText('Starting');
    await expectScreenshot();
});

test('FlowStatusToolbar: start is enabled again once working', async ({mount, page, router}) => {
    const mock = makeFlowStatusMock('Stopped', {
        transitions: {start: 'Working'},
        holdActions: true,
    });
    await router.use(...mock.handlers);
    await mount(<FlowStatusToolbarStories.Stopped />);

    const start = page.getByRole('button', {name: 'Start'});
    await start.click();
    await expect(start).toBeDisabled();
    expect(mock.calls).toEqual(['start']);

    // The pipeline reaches Working and the status is reloaded right after the start request.
    mock.releaseActions();
    await expect(start).toBeEnabled();
    await expect(start).toHaveText('Start');
});

test('FlowStatusToolbar: failed stop unblocks the button', async ({mount, page, router}) => {
    const mock = makeFlowStatusMock('Working', {failingActions: ['stop'], holdActions: true});
    await router.use(...mock.handlers);
    await mount(<FlowStatusToolbarStories.Working />);

    const stop = page.getByRole('button', {name: 'Stop'});
    await stop.click();
    await expect(stop).toBeDisabled();

    mock.releaseActions();
    await expect(stop).toBeEnabled();
    await expect(stop).toHaveText('Stop');
    expect(mock.calls).toEqual(['stop']);
});

test('FlowStatusToolbar: pause is not sent for a stopped pipeline', async ({
    mount,
    page,
    router,
}) => {
    const mock = makeFlowStatusMock('Stopped');
    await router.use(...mock.handlers);
    await mount(<FlowStatusToolbarStories.Stopped />);

    const pause = page.getByRole('button', {name: /^Paus/});
    await pause.click();
    await expect(pause).toBeEnabled();
    await expect(pause).toHaveText('Pause');
    expect(mock.calls).toEqual([]);
});

test('FlowStatusToolbar: start is not sent while the pipeline is stopping', async ({
    mount,
    page,
    router,
}) => {
    const mock = makeFlowStatusMock('Draining');
    await router.use(...mock.handlers);
    await mount(<FlowStatusToolbarStories.Draining />);

    await expect(page.getByRole('button', {name: 'Stop'})).toHaveText('Stopping');
    const start = page.getByRole('button', {name: 'Start'});
    await start.click();
    await expect(start).toHaveText('Start');
    expect(mock.calls).toEqual([]);
});
