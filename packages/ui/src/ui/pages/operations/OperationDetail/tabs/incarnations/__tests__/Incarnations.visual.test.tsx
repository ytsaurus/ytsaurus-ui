import React from 'react';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../playwright-components/core';

import {IncarnationStories} from '../__stories__';
import {
    operationEventsHandler,
    operationEventsHandlerEmpty,
    operationEventsHandlerError,
} from '../__stories__/mocks';

test('Incarnations: Default', async ({mount, expectScreenshot, page, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationEventsHandler);
    await mount(<IncarnationStories.Default />);
    await page.getByText('1b300024-abd4f4c4-d9ff576a-9989d2c0').click();
    await expectScreenshot();
});

test('Incarnations: Error', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationEventsHandlerError);
    await mount(<IncarnationStories.Error />);
    await expectScreenshot();
});

test('Incarnations: Empty', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationEventsHandlerEmpty);
    await mount(<IncarnationStories.Empty />);
    await expectScreenshot();
});

test('Incarnations: WithTelemetryAndAlert', async ({mount, expectScreenshot}) => {
    await mount(<IncarnationStories.WithTelemetryAndAlert />);
    await expectScreenshot();
});
