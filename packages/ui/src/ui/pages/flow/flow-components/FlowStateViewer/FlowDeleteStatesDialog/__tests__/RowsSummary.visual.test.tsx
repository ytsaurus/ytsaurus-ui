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

test('RowsSummary: renders complete typed keys and nested values as YSON', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await mount(
        <RowsSummary
            rows={[
                {
                    ...rows[0],
                    key: [{$type: 'uint64', $value: '18446744073709551615'}, 'ключ'],
                    value: {
                        count: {$type: 'int64', $value: '9223372036854775807'},
                        nested: [{$type: 'uint64', $value: '9007199254740993'}, 'значение'],
                    },
                },
            ]}
        />,
    );
    const row = page.getByRole('table').getByRole('row').nth(1);
    const key = row.getByRole('cell').nth(2);
    const value = row.getByRole('cell').nth(3);
    await expect(key).toContainText('18446744073709551615');
    await expect(key).toContainText('ключ');
    await expect(value).toContainText('9223372036854775807');
    await expect(value).toContainText('9007199254740993');
    await expect(value).toContainText('значение');
    await expect(row).not.toContainText('$type');
    await expect(row).not.toContainText('$value');
    await row.hover();
    await expect(row.getByRole('button', {name: 'Copy value', exact: true})).toBeVisible();
    await expectScreenshot();
});
