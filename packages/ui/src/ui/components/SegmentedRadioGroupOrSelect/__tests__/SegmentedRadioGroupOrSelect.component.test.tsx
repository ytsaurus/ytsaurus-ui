import React from 'react';

import {expect, test} from '../../../playwright-components/core';
import {SegmentedRadioGroupOrSelectStories} from '../__stories__';

test.use({viewport: {width: 1600, height: 900}});

test('SegmentedRadioGroupOrSelect: observe each neighbor and preserve selection', async ({
    mount,
    page,
}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveNeighbors />);
    const first = page.getByRole('button', {name: 'Resize first neighbor', exact: true});
    const second = page.getByRole('button', {name: 'Resize second neighbor', exact: true});

    await test.step('First neighbor changes the mode without changing the selected value', async () => {
        await page.getByRole('radio', {name: 'Option 3', exact: true}).check();
        await first.click();
        await expect(page.getByRole('button', {name: 'Option 3', exact: true})).toBeVisible();
        await first.click();
        await expect(page.getByRole('radio', {name: 'Option 3', exact: true})).toBeChecked();
    });

    await test.step('Second neighbor triggers the same check and Select remains interactive', async () => {
        await second.click();
        await page.getByRole('button', {name: 'Option 3', exact: true}).click();
        await page.getByRole('option', {name: 'Option 5', exact: true}).click();
        await expect(page.getByText('Selected value: option5', {exact: true})).toBeVisible();
        await second.click();
        await expect(page.getByRole('radio', {name: 'Option 5', exact: true})).toBeChecked();
    });
});

test('SegmentedRadioGroupOrSelect: observe added and replaced elements', async ({mount, page}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveNeighbors />);
    const selectedRadio = page.getByRole('radio', {name: 'Option 1', exact: true});
    const selectedButton = page.getByRole('button', {name: 'Option 1', exact: true});
    const showFirst = page.getByRole('checkbox', {name: 'Show first neighbor'});
    const first = page.getByRole('button', {name: 'Resize first neighbor', exact: true});
    const second = page.getByRole('button', {name: 'Resize second neighbor', exact: true});

    await test.step('Removing a wide neighbor restores Radio; adding it restores observation', async () => {
        await first.click();
        await expect(selectedButton).toBeVisible();
        await showFirst.uncheck();
        await expect(selectedRadio).toBeChecked();
        await showFirst.check();
        await expect(selectedRadio).toBeChecked();
        await first.click();
        await expect(selectedButton).toBeVisible();
        await first.click();
        await expect(selectedRadio).toBeChecked();
    });

    await test.step('Replacing a wide neighbor observes the new element', async () => {
        await second.click();
        await expect(selectedButton).toBeVisible();
        await page.getByRole('button', {name: 'Replace second neighbor', exact: true}).click();
        await expect(selectedRadio).toBeChecked();
        await second.click();
        await expect(selectedButton).toBeVisible();
        await second.click();
        await expect(selectedRadio).toBeChecked();
    });
});

test('SegmentedRadioGroupOrSelect: spacer signals released space', async ({mount, page}) => {
    await mount(<SegmentedRadioGroupOrSelectStories.ObserveSpacer />);
    const selectedRadio = page.getByRole('radio', {name: 'Option 1', exact: true});
    const selectedButton = page.getByRole('button', {name: 'Option 1', exact: true});
    const resizeNeighbor = page.getByRole('button', {name: 'Resize first neighbor', exact: true});

    await expect(selectedRadio).toBeChecked();
    await resizeNeighbor.click();
    await expect(selectedButton).toBeVisible();
    await resizeNeighbor.click();
    await expect(selectedRadio).toBeChecked();
});
