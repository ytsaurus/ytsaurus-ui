import React from 'react';

import {expect, test} from '../../../../playwright-components/core';
import {FlowRoutedLinkStory} from '../__stories__/FlowRoutedLinkScenario';

test('FlowRoutedStoryHarness: scopes RoutedLink navigation to Flow stories', async ({
    mount,
    page,
}) => {
    await mount(<FlowRoutedLinkStory />);

    await page.getByRole('link', {name: 'Open state'}).click();
    await expect(page.getByText('/test-cluster/flows/state', {exact: true})).toBeVisible();
});
