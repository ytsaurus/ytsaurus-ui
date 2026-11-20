import React from 'react';

import {expect, test} from '../../../playwright-components/core';

import {SegmentedRadioGroupOrSelectStories} from '../__stories__';

test('SegmentedRadioGroupOrSelect: ObserveParent', async ({mount, expectScreenshot, page}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveParent />);
    await expect(page.getByRole('radio', {name: 'Option 1', exact: true})).toBeVisible();
    await expectScreenshot();

    await page.getByText('Half parent').click();
    await expect(page.getByRole('button', {name: 'Option 1', exact: true})).toBeVisible();
    await expectScreenshot();

    await page.getByText('Half parent').click();
    await expect(page.getByRole('radio', {name: 'Option 1', exact: true})).toBeVisible();
    await expectScreenshot();
});

test('SegmentedRadioGroupOrSelect: ObserveGrandParent', async ({mount, expectScreenshot, page}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveGrandParent />);
    await expect(page.getByRole('radio', {name: 'Option 1', exact: true})).toBeVisible();
    await expectScreenshot();

    await page.getByText('Half grand-parent').click();
    await expect(page.getByRole('button', {name: 'Option 1', exact: true})).toBeVisible();
    await expectScreenshot();

    await page.getByText('Half grand-parent').click();
    await expect(page.getByRole('radio', {name: 'Option 1', exact: true})).toBeVisible();
    await expectScreenshot();
});
