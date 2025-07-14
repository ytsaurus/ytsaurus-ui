<<<<<<< Updated upstream
import * as React from 'react';
import {http} from 'msw';
=======
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
test('render story: <Default>', async ({mount, expectScreenshot, router}) => {
    await router.use(
        http.post('https://test-cluster.yt.my-domain.com/api/v3/execute_batch', () => {
            return Response.json(pathsResponse);
        }),
    );
=======
test('NavigationWidget: <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(pathsHandlerError);
>>>>>>> Stashed changes

    await mount(Error.render?.());
    await expectScreenshot();
});
