import {test} from '../../../playwright-components/core';

import {Tooltip} from '../Tooltip';

test('Tooltip: Default', async ({mount, expectScreenshot, page}) => {
    await mount(
        <Tooltip
            content="Simple text"
            placement="right"
            openDelay={400}
            closeDelay={400}
            disabled={false}
            useFlex={false}
            ellipsis={false}
        >
            Hover me
        </Tooltip>,
    );

    await expectScreenshot({
        component: page,
        beforeScreenshot: async () => {
            await page.getByText('Hover me').hover();
            await page.getByText('Simple text', {exact: true}).waitFor({state: 'visible'});
        },
    });
});
