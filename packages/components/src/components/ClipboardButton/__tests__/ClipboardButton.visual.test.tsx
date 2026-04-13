import {test} from '../../../playwright-components/core';

import {ClipboardButton} from '../ClipboardButton';

test('ClipboardButton: Default', async ({mount, expectScreenshot}) => {
    await mount(<ClipboardButton text="Some text" view="outlined" />);
    await expectScreenshot();
});
