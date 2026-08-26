import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateKeyDialog} from '../FlowStateKeyDialog';

test('FlowStateKeyDialog: visible title and vertical fields', async ({mount, page}) => {
    await mount(
        <FlowStateKeyDialog
            visible
            columns={[
                {name: 'account', type: 'string'},
                {name: 'region', type: 'string'},
            ]}
            values={{account: 'alice', region: 'ru-central1'}}
            onApply={() => {}}
            onClose={() => {}}
        />,
    );

    const dialog = page.getByRole('dialog');
    const title = await dialog.evaluate((element) => {
        const titleIds =
            element.getAttribute('aria-labelledby')?.split(/\s+/).filter(Boolean) ?? [];
        const titles = titleIds.flatMap((id) => {
            const candidate = document.getElementById(id);
            return candidate && element.contains(candidate) ? [candidate] : [];
        });
        return {
            titleIds,
            containedTitleCount: titles.length,
            globalTitleCount: titleIds.length
                ? document.querySelectorAll(`[id="${CSS.escape(titleIds[0])}"]`).length
                : 0,
            titleText: titles[0]?.textContent?.trim() ?? '',
            visible:
                titles[0] !== undefined &&
                getComputedStyle(titles[0]).display !== 'none' &&
                getComputedStyle(titles[0]).visibility !== 'hidden',
        };
    });
    expect(title.titleIds).toHaveLength(1);
    expect(title.containedTitleCount).toBe(1);
    expect(title.globalTitleCount).toBe(1);
    expect(title.titleText).not.toBe('');
    expect(title.visible).toBe(true);
    await expect(dialog).toHaveAccessibleName(title.titleText);

    const fields = dialog.getByRole('textbox');
    await expect(fields).toHaveCount(2);
    const first = await fields.nth(0).boundingBox();
    const second = await fields.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (!first || !second) {
        throw new Error('Expected both key fields to have browser geometry');
    }
    expect(first.height).toBeGreaterThan(0);
    expect(second.height).toBeGreaterThan(0);
    expect(second.y).toBeGreaterThan(first.y);
    expect(first.y + first.height).toBeLessThanOrEqual(second.y);
});
