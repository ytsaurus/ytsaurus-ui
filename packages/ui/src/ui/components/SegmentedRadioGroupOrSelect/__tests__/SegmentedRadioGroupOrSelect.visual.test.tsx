import React from 'react';

import {test} from '../../../playwright-components/core';

import {SegmentedRadioGroupOrSelectStories} from '../__stories__';

test('SegmentedRadioGroupOrSelect: ObserveParent', async ({mount, expectScreenshot, page}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveParent />);
    await page.waitForTimeout(500);
    await expectScreenshot();

    await page.getByText('Half parent').click();
    await page.waitForTimeout(500);
    await expectScreenshot();

    await page.getByText('Half parent').click();
    await page.waitForTimeout(500);
    await expectScreenshot();
});

test('SegmentedRadioGroupOrSelect: ObserveGrandParent', async ({mount, expectScreenshot, page}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveGrandParent />);
    await page.waitForTimeout(500);
    await expectScreenshot();

    await page.getByText('Half grand-parent').click();
    await page.waitForTimeout(500);
    await expectScreenshot();

    await page.getByText('Half grand-parent').click();
    await page.waitForTimeout(500);
    await expectScreenshot();
});
