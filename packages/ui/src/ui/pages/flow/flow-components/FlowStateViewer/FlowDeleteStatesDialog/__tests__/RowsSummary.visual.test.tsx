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
    await row.hover();
    await expectScreenshot();
});

test('RowsSummary: narrow overflow remains usable', async ({mount, expectScreenshot, page}) => {
    await mount(<RowsSummary rows={rows} />, {width: 480});
    await expect(page.getByRole('table')).toBeVisible();
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
