import React from 'react';

import {test} from '../../../playwright-components/core';

import {FormatNumberStories} from '../__stories__';

test('FormatNumber: Number', async ({page, mount, expectScreenshot}) => {
    const mounted = await mount(<FormatNumberStories.Number />, {width: 300});
    await mounted.locator('.yt-format-number').hover();
    await page.locator('.yt-tooltip__popup').waitFor({state: 'visible'});
    await expectScreenshot();
});

test('FormatNumber: NumberWithTooltip', async ({page, mount, expectScreenshot}) => {
    const mounted = await mount(<FormatNumberStories.NumberWithTooltip />, {width: 300});
    await mounted.locator('.yt-format-number').hover();
    await page.locator('.yt-tooltip__popup').waitFor({state: 'visible'});
    await expectScreenshot();
});

test('FormatNumber: NumberWithoutTooltip', async ({page, mount, expectScreenshot}) => {
    const mounted = await mount(<FormatNumberStories.NumberWithoutTooltip />, {width: 300});
    await mounted.locator('.yt-format-number').hover();
    await page.locator('.yt-tooltip__popup').waitFor({state: 'visible'});
    await expectScreenshot();
});

test('FormatNumber: NumberSmart', async ({page, mount, expectScreenshot}) => {
    const mounted = await mount(<FormatNumberStories.NumberSmart />, {width: 300});
    await mounted.locator('.yt-format-number').hover();
    await page.locator('.yt-tooltip__popup').waitFor({state: 'visible'});
    await expectScreenshot();
});

test('FormatNumber: Bytes', async ({page, mount, expectScreenshot}) => {
    const mounted = await mount(<FormatNumberStories.Bytes />, {width: 300});
    await mounted.locator('.yt-format-number').hover();
    await page.locator('.yt-tooltip__popup').waitFor({state: 'visible'});
    await expectScreenshot();
});

test('FormatNumber: Bytes100Kb', async ({page, mount, expectScreenshot}) => {
    const mounted = await mount(<FormatNumberStories.Bytes100Kb />, {width: 300});
    await mounted.locator('.yt-format-number').hover();
    await page.locator('.yt-tooltip__popup').waitFor({state: 'visible'});
    await expectScreenshot();
});
