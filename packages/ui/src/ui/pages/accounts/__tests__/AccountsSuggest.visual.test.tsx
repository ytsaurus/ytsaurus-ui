import React from 'react';
import {composeStories} from '@storybook/react';

import {expect, test} from '../../../playwright-components/core';
import * as AccountsSuggestStoryComponents from '../__stories__/AccountsSuggest.stories';

const AccountsSuggestStories = composeStories(AccountsSuggestStoryComponents);

test('AccountsSuggest: loading', async ({mount, page}) => {
    const component = await mount(<AccountsSuggestStories.Loading />);
    await component.getByRole('button').click();

    await expect(
        page.getByTestId('select-list').locator('[class*="loading-indicator"]'),
    ).toBeVisible();
});

test('AccountsSuggest: error', async ({mount}) => {
    const component = await mount(<AccountsSuggestStories.Error />);

    await expect(component.getByText('Failed to load accounts')).toBeVisible();
});

test('AccountsSuggest: disabled keeps the selected value', async ({mount}) => {
    const component = await mount(<AccountsSuggestStories.Disabled />);

    await expect(component.getByRole('button')).toBeDisabled();
    await expect(component.getByText('parent')).toBeVisible();
});
