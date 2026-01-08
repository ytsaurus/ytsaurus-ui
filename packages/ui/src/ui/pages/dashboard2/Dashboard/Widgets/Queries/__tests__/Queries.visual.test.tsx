import React from 'react';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../playwright-components/core';

import {Default, Empty, Error} from '../__stories__/Queries.stories';
import {queriesHandler, queriesHandlerEmpty, queriesHandlerError} from './mocks';

export const MOCK_DATE = '2025-07-19T10:00:00';

test('Queries: story <Default>', async ({mount, expectScreenshot, router, page}) => {
    await page.clock.install({time: new Date(MOCK_DATE)});

    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(queriesHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('Queries: story <Default> with error modal', async ({
    mount,
    expectScreenshot,
    router,
    page,
}) => {
    await page.clock.install({time: new Date(MOCK_DATE)});

    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(queriesHandler);

    await mount(<div style={{width: 1000, height: 600}}>{Default.render?.()}</div>);
    await page.locator('.g-button.g-button_pin_round-round').click();

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
