import React from 'react';

import {expect, test} from '../../../../../../../playwright-components/core';

import {SchedulingPoolMetaTableStories} from '../__stories__';

test('SchedulingPoolMetaTable: Customized', async ({mount, expectScreenshot, page}) => {
    await mount(<SchedulingPoolMetaTableStories.Customized />);

    await expect(page.getByText('General')).toBeVisible();
    await expect(page.getByText('Usage / Strong guarantees')).toBeVisible();
    await expect(page.getByText('Custom metadata')).toBeVisible();
    await expectScreenshot();
});
