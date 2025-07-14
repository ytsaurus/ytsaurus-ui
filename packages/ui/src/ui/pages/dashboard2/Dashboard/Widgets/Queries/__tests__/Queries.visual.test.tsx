// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../playwright-components/core';

import {Default, Empty, Error} from '../__stories__/Queries.stories';
import {queriesHandler, queriesHandlerEmpty, queriesHandlerError} from './mocks';

test('Queries: story <Default>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(queriesHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('Queries: story <Empty>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(queriesHandlerEmpty);

    await mount(Empty.render?.());
    await expectScreenshot();
});

test('Queries: story <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(queriesHandlerError);

    await mount(Error.render?.());
    await expectScreenshot();
});
