import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {TargetQueueStories} from '../__stories__';

test('TargetQueue: switches a named consumer', async ({mount, expectScreenshot, page}) => {
    await mount(<TargetQueueStories.NamedConsumers />);

    await page.getByText('primary', {exact: true}).click();
    await page.getByText('analytics', {exact: true}).click();
    await expect(
        page.getByText('test-cluster://home/queues/analytics', {exact: true}),
    ).toBeVisible();
    await page.mouse.move(0, 0);
    await expectScreenshot();
});

test('TargetQueue: shows an error and switches to a healthy consumer', async ({
    mount,
    expectScreenshot,
    page,
}) => {
    await mount(<TargetQueueStories.BrokenNamedConsumer />);

    await test.step('Show the selected consumer error', async () => {
        await expect(page.getByText('Consumer failed', {exact: true})).toBeVisible();
        await expectScreenshot();
    });

    await test.step('Switch to a healthy consumer and clear the error', async () => {
        await page.getByText('broken', {exact: true}).click();
        await page.getByText('primary', {exact: true}).click();
        await expect(
            page.getByText('test-cluster://home/queues/primary', {exact: true}),
        ).toBeVisible();
        await expect(page.getByText('Consumer failed', {exact: true})).not.toBeVisible();
        await page.mouse.move(0, 0);
        await expectScreenshot();
    });
});
