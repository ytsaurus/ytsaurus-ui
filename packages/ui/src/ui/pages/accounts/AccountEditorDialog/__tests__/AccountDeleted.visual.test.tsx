import React from 'react';

import {expect, test} from '../../../../playwright-components/core';
import {AccountDeletedStories} from '../__stories__';

test('AccountEditor: keeps deleted state open until the user closes it', async ({mount, page}) => {
    await mount(<AccountDeletedStories.Default />);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Account deleted-account has been deleted')).toBeVisible();

    await page.getByRole('button', {name: 'Close'}).click();

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Editor closed')).toBeVisible();
});
