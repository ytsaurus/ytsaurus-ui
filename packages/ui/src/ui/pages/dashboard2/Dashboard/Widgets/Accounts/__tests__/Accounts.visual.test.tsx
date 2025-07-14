// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {test} from '../../../../../../playwright-components/core';

import {Default, Empty, Error} from '../__stories__/Accounts.stories';
import {accountsHandler, accountsHandlerEmpty, accountsHandlerError} from './mocks';

test('Accounts: story <Default>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(accountsHandler);

    await mount(Default.render?.());
    await expectScreenshot();
});

test('Accounts: story <Empty>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(accountsHandlerEmpty);

    await mount(Empty.render?.());
    await expectScreenshot();
});

test('Accounts: story <Error>', async ({mount, expectScreenshot, router}) => {
    yt.setup.setGlobalOption('proxy', 'test-cluster.yt.my-domain.com');
    await router.use(accountsHandlerError);

    await mount(Error.render?.());
    await expectScreenshot();
});
