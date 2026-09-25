import React from 'react';
import {type Locator} from '@playwright/test';

import {expect, test} from '../../../../playwright-components/core';
import {AccountQuotaEditorStories} from '../__stories__/index';

async function setQuota(component: Locator, value = '12'): Promise<void> {
    await component.locator('.account-quota__edit').click();
    await component.getByTestId('quota-editor-new-limit').locator('input').fill(value);
    await component.getByTestId('quota-editor-save').click();
    await component.getByTestId('quota-editor-confirmation-yes').click();
}

test('AccountQuotaEditor: transfers quota for a child account', async ({mount}) => {
    const component = await mount(<AccountQuotaEditorStories.ChildWithTransfer />);

    await setQuota(component);

    await expect(component.getByTestId('quota-result')).toContainText(
        '"distributeAccount":"source"',
    );
});

test('AccountQuotaEditor: returns quota from a child account', async ({mount}) => {
    const component = await mount(<AccountQuotaEditorStories.ChildWithTransfer />);

    await setQuota(component, '8');

    await expect(component.getByTestId('quota-result')).toContainText('"limitDiff":-2');
    await expect(component.getByTestId('quota-result')).toContainText(
        '"distributeAccount":"source"',
    );
});
