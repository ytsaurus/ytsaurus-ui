import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateFiltersStories} from '../__stories__';
import type {FlowStateFiltersValue} from '../../types';

test('FlowStateFilters: Clear aligns with the state search input', async ({mount, page}) => {
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
    const filter = page.locator('.yt-select__filter');
    const search = filter.getByRole('textbox');
    const clear = filter.getByRole('button', {name: 'Clear', exact: true});
    await expect(search).toBeVisible();
    await expect(clear).toBeVisible();

    await expect
        .poll(() =>
            filter.evaluate((element) => {
                const searchBox = element.querySelector('input')?.getBoundingClientRect();
                const clearBox = element.querySelector('button')?.getBoundingClientRect();
                if (!searchBox || !clearBox) {
                    throw new Error('State search and Clear button must have visible bounds.');
                }
                return Math.abs(
                    searchBox.y + searchBox.height / 2 - clearBox.y - clearBox.height / 2,
                );
            }),
        )
        .toBeLessThan(1);

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

    const primaryRow = page.locator('.yt-flow-state-filters__row_primary');
    const secondaryRow = page.locator('.yt-flow-state-filters__row_secondary');
    const key = page.getByRole('textbox', {name: 'Key'});
    const reset = page.getByRole('button', {name: 'Reset filters'});
    const raw = page.getByRole('button', {name: 'Show raw response'});
    const info = page.getByRole('button', {name: 'About bounded results'});

    await expect(primaryRow).toBeVisible();
    await expect(secondaryRow).toBeVisible();
    expect(await primaryRow.getByRole('textbox', {name: 'Key'}).count()).toBe(0);
    await expect(secondaryRow.getByRole('textbox', {name: 'Key'})).toBeVisible();

    const [keyBox, resetBox, rawBox, infoBox] = await Promise.all([
        key.boundingBox(),
        reset.boundingBox(),
        raw.boundingBox(),
        info.boundingBox(),
    ]);
    expect(keyBox).not.toBeNull();
    expect(resetBox).not.toBeNull();
    expect(rawBox).not.toBeNull();
    expect(infoBox).not.toBeNull();
    expect(Math.abs((keyBox?.y ?? 0) - (resetBox?.y ?? 0))).toBeLessThan(12);
    expect((rawBox?.y ?? 0) + (rawBox?.height ?? 0) / 2).toBe(
        (resetBox?.y ?? 0) + (resetBox?.height ?? 0) / 2,
    );
    expect((infoBox?.y ?? 0) + (infoBox?.height ?? 0) / 2).toBe(
        (resetBox?.y ?? 0) + (resetBox?.height ?? 0) / 2,
    );
    expect((rawBox?.x ?? 0) - ((resetBox?.x ?? 0) + (resetBox?.width ?? 0))).toBeLessThan(16);
    expect((infoBox?.x ?? 0) - ((rawBox?.x ?? 0) + (rawBox?.width ?? 0))).toBeLessThan(12);

    await expectScreenshot();
});
