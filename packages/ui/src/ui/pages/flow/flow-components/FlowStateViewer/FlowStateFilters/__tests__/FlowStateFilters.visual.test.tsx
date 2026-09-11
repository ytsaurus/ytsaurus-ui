import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateFiltersStories} from '../__stories__';
import type {FlowStateFiltersValue} from '../../types';

test('FlowStateFilters: clears the state filter', async ({mount, page}) => {
    let changedValue: FlowStateFiltersValue | undefined;
    await mount(
        <FlowStateFiltersStories.TwoRowToolbar
            value={{
                computationId: 'checkout',
                target: 'all',
                keyValues: {},
                stateName: '/checkout',
            }}
            onChange={(value) => {
                changedValue = value;
            }}
        />,
    );

    await page.getByRole('button', {name: 'State /checkout', exact: true}).click();
    const search = page.getByRole('textbox', {name: '', exact: true});
    const clear = page.getByRole('button', {name: 'Clear', exact: true});
    await expect(search).toBeVisible();
    await expect(clear).toBeVisible();

    await clear.click();
    await expect
        .poll(() => changedValue)
        .toEqual({
            computationId: 'checkout',
            target: 'all',
            keyValues: {},
            stateName: undefined,
        });
});

test('FlowStateFilters: two-row toolbar', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateFiltersStories.TwoRowToolbar />);

    await expect(page.getByRole('textbox', {name: 'Key'})).toBeVisible();
    await expectScreenshot();
});
