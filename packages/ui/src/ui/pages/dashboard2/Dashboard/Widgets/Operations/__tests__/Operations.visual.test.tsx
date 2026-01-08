// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../playwright-components/core';

import {
    Default,
    Empty,
    Error,
    Loading,
    LongNamesShortWidget,
} from '../__stories__/Operations.stories';
import {
    operationsHandler,
    operationsHandlerEmpty,
    operationsHandlerError,
    operationsHandlerLongNames,
    operationsHandlerWithLoading,
} from './mocks';

export const MOCK_DATE = '2025-07-19T10:00:00';

test('Operations: story <Default>', async ({mount, expectScreenshot, router, page}) => {
    await page.clock.install({time: new Date(MOCK_DATE)});

    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationsHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('Operations: story <Loading>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationsHandlerWithLoading);

    await mount(Loading.render?.());
    await expectScreenshot();
});

test('Operations: story <Empty>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationsHandlerEmpty);

    await mount(Empty.render?.());
    await expectScreenshot();
});

test('Operations: story <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationsHandlerError);

    await mount(Error.render?.());
    await expectScreenshot();
});

test('Operations: story <LongNamesShortWidget>', async ({
    mount,
    expectScreenshot,
    router,
    page,
}) => {
    await page.clock.install({time: new Date(MOCK_DATE)});

    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(operationsHandlerLongNames);

    await mount(LongNamesShortWidget.render?.());
    await expectScreenshot();
});
