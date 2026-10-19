import React from 'react';

import {expect, test} from '../../../playwright-components/core';
import {AccountsSuggestStories} from '../__stories__';

test('AccountsSuggest: loading', async ({mount, page, expectScreenshot}) => {
    const component = await mount(<AccountsSuggestStories.Loading />);
    await component.getByRole('button').click();

    await expect(
        page.getByTestId('select-list').locator('[class*="loading-indicator"]'),
    ).toBeVisible();
    await expectScreenshot({
        component: page,
        themes: ['light'],
        clip: {x: 0, y: 0, width: 400, height: 180},
    });
});

test('AccountsSuggest: error', async ({mount, expectScreenshot}) => {
    const component = await mount(<AccountsSuggestStories.Error />);

    await expect(component.getByText('Failed to load accounts')).toBeVisible();
    await expectScreenshot({component});
});

test('AccountsSuggest: disabled keeps the selected value', async ({mount, expectScreenshot}) => {
    const component = await mount(<AccountsSuggestStories.Disabled />);

    await expect(component.getByRole('button')).toBeDisabled();
    await expectScreenshot({component});
});
