// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../../../playwright-storybook/core';
import {Default, Empty, Error, Loading} from '../__stories__/Navigation.stories';

import {pathsHandler, pathsHandlerEmpty, pathsHandlerError, pathsHandlerWithLoading} from './mocks';

test('NavigationWidget: <Default>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(pathsHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('NavigationWidget: <Loading>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(pathsHandlerWithLoading);

    await mount(Loading.render?.());
    await expectScreenshot();
});

test('NavigationWidget: <Empty>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(pathsHandlerEmpty);

    await mount(Empty.render?.());
    await expectScreenshot();
});

test('NavigationWidget: <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(pathsHandlerError);

    await mount(Error.render?.());
    await expectScreenshot();
});
