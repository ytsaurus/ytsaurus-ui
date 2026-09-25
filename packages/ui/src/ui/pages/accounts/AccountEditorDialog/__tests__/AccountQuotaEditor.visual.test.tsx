import React from 'react';
import {type Locator} from '@playwright/test';

import {expect, test} from '../../../../playwright-components/core';
import {AccountQuotaEditorStories} from '../__stories__';

async function setQuota(component: Locator): Promise<void> {
    await component.locator('.account-quota__edit').click();
    await component.getByTestId('quota-editor-new-limit').locator('input').fill('12');
    await component.getByTestId('quota-editor-save').click();
    await component.getByTestId('quota-editor-confirmation-yes').click();
}

test('AccountQuotaEditor: changes a top-level quota directly', async ({mount}) => {
    const component = await mount(<AccountQuotaEditorStories.TopLevel />);

    await setQuota(component);

    await expect(component.getByTestId('quota-result')).toContainText('"limit":12');
    await expect(component.getByTestId('quota-result')).toContainText('"limitDiff":2');
    await expect(component.getByTestId('quota-result')).toContainText('"distributeAccount":""');
});

test('AccountQuotaEditor: transfers quota for a child account', async ({mount}) => {
    const component = await mount(<AccountQuotaEditorStories.ChildWithTransfer />);

    await setQuota(component);

    await expect(component.getByTestId('quota-result')).toContainText(
        '"distributeAccount":"source"',
    );
});
