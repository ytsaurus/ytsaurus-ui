import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {RowsSummary} from '../RowsSummary';

const rows = [
    {
        section: 'key_state' as const,
        computationId: 'checkout-attribution',
        key: ['4506162232340681623', 'checkout'],
        stateName: '/a/long/counter/state/name',
        value: {events: 7, campaign: 'summer-promotion-with-a-long-name'},
    },
    {
        section: 'partition_state' as const,
        computationId: 'checkout-attribution',
        partitionId: '451c1f9-678607be-3b545a99-97dc719a',
        stateName: '/window',
        value: {closed: false},
    },
];

test('RowsSummary: headed complete-value table', async ({mount, expectScreenshot, page}) => {
    await mount(<RowsSummary rows={rows} />);
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('row').first().getByRole('cell')).toHaveText([
        'Computation',
        'State',
        'Partition',
        'Key',
        'Value',
    ]);
    const row = table.getByRole('row').nth(1);
    const copyAction = row.locator('.yt-flow-delete-states-rows-summary__hover-action');
    await expect(copyAction).toHaveCSS('opacity', '0');
    await expect(copyAction).toHaveCSS('pointer-events', 'none');
    await row.hover();
    await expect(copyAction).toHaveCSS('opacity', '1');
    await expect(copyAction).toHaveCSS('pointer-events', 'auto');
    await expectScreenshot();
    await page.mouse.move(0, 0);
    const copyButton = row.getByRole('button', {name: 'Copy value'});
    await copyButton.focus();
    await expect(copyButton).toBeFocused();
    await expect(copyAction).toHaveCSS('opacity', '1');
    await expect(copyAction).toHaveCSS('pointer-events', 'auto');
});

test('RowsSummary: narrow overflow remains usable', async ({mount, expectScreenshot, page}) => {
    await mount(<RowsSummary rows={rows} />, {width: 480});
    const pane = page.locator('.yt-flow-delete-states-rows-summary__table-pane');
    await expect(pane).toHaveCSS('overflow-x', 'visible');
    const horizontalScrollContainers = await pane.evaluate(
        (element) =>
            [element, ...element.querySelectorAll('*')].filter((candidate) => {
                const overflow = getComputedStyle(candidate).overflowX;
                return (
                    (overflow === 'auto' || overflow === 'scroll') &&
                    candidate.scrollWidth > candidate.clientWidth
                );
            }).length,
    );
    expect(horizontalScrollContainers).toBeLessThanOrEqual(1);
    await expectScreenshot();
});

test('RowsSummary: hides empty optional coordinates', async ({mount, page}) => {
    await mount(<RowsSummary rows={[rows[0]]} />);

    await expect(page.getByRole('table').getByRole('row').first().getByRole('cell')).toHaveText([
        'Computation',
        'State',
        'Key',
        'Value',
    ]);
});
