// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../../../playwright-storybook/core';

import {Default, Empty, Error, Loading} from '../__stories__/Services.stories';
import {
    servicesHandler,
    servicesHandlerEmpty,
    servicesHandlerError,
    servicesHandlerWithLoading,
} from './mocks';

test('Services: story <Default>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(...servicesHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('Services: story <Loading>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(...servicesHandlerWithLoading);

    await mount(Loading.render?.());
    await expectScreenshot();
});

test('Services: story <Empty>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(...servicesHandlerEmpty);

    await mount(Empty.render?.());
    await expectScreenshot();
});

test('Services: story <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(...servicesHandlerError);

    await mount(Error.render?.());
    await expectScreenshot();
});
