import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {TargetQueueStories} from '../__stories__';

test('TargetQueue: switches a named consumer', async ({mount, expectScreenshot, page}) => {
    await mount(<TargetQueueStories.NamedConsumers />);

    await page.getByText('primary', {exact: true}).click();
    await page.getByText('analytics', {exact: true}).click();
    await expect(page.getByText('markov://home/queues/analytics', {exact: true})).toBeVisible();
    await expectScreenshot();
});

test('TargetQueue: shows an error and switches to a healthy consumer', async ({
    mount,
    expectScreenshot,
    page,
}) => {
    await mount(<TargetQueueStories.BrokenNamedConsumer />);

    await expect(page.getByText('Consumer failed', {exact: true})).toBeVisible();
    await expectScreenshot();

    await page.getByText('broken', {exact: true}).click();
    await page.getByText('primary', {exact: true}).click();
    await expect(page.getByText('markov://home/queues/primary', {exact: true})).toBeVisible();
});
