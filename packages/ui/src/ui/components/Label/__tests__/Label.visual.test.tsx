import React from 'react';

import {test} from '../../../playwright-components/core';

import {LabelStories} from '../__stories__';

test('Label: AllThemesShowcase', async ({mount, expectScreenshot}) => {
    await mount(<LabelStories.AllThemesShowcase />);
    await expectScreenshot();
});
