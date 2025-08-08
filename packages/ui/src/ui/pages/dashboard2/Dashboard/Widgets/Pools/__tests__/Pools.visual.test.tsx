// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../playwright-components/core';

import {Default, Empty, Error} from '../__stories__/Pools.stories';
import {poolsHandler, poolsHandlerEmpty, poolsHandlerError} from './mocks';

test('Pools: story <Default>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(poolsHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('Pools: story <Empty>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(poolsHandlerEmpty);

    await mount(Empty.render?.());
    await expectScreenshot();
});

test('Pools: story <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(poolsHandlerError);

    await mount(Error.render?.());
    await expectScreenshot();
});
