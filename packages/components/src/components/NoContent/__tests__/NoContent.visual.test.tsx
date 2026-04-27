import {test} from '../../../../playwright-components/core';

import {NoContent} from '../NoContent';

test('NoContent: Default', async ({mount, expectScreenshot}) => {
    await mount(
        <NoContent
            warning="Nothing here"
            hint="Try changing filters or pick another path."
            padding="regular"
            imageSize={140}
            vertical={false}
        />,
    );
    await expectScreenshot();
});

test('NoContent: PaddingLarge', async ({mount, expectScreenshot}) => {
    await mount(
        <NoContent
            warning="Nothing here"
            hint="Try changing filters or pick another path."
            padding="large"
            imageSize={140}
            vertical={false}
        />,
    );
    await expectScreenshot();
});

test('NoContent: Vertical', async ({mount, expectScreenshot}) => {
    await mount(
        <NoContent
            warning="Nothing here"
            hint="Try changing filters or pick another path."
            padding="regular"
            imageSize={140}
            vertical
        />,
    );
    await expectScreenshot();
});
