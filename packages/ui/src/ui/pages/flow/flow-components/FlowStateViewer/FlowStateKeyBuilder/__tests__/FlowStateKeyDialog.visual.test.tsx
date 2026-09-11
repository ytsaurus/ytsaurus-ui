import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateKeyStories} from '../__stories__';

test('FlowStateKeyBuilder: narrow raw input and pencil launcher stay adjacent', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await mount(<FlowStateKeyStories.Narrow />, {width: 480});

    const rawInput = page.getByPlaceholder('[account]');
    const launcher = page.getByRole('button', {name: 'Edit fields'});
    await expect(rawInput).toBeInViewport();
    await expect(launcher).toBeInViewport();
    await expectScreenshot();
    await launcher.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Edit fields');
});

test('FlowStateKeyDialog: has an accessible title and vertical fields', async ({
    mount,
    page,
    expectScreenshot,
}) => {
    await mount(<FlowStateKeyStories.Fields />);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAccessibleName('Edit key fields');

    const accountName = dialog.getByText('account', {exact: true});
    const stringType = dialog.getByPlaceholder('string');
    const regionName = dialog.getByText('region', {exact: true});
    const integerType = dialog.getByPlaceholder('int64');
    await expect(accountName).toHaveCount(1);
    await expect(stringType).toHaveCount(1);
    await expect(regionName).toHaveCount(1);
    await expect(integerType).toHaveCount(1);
    await expectScreenshot({component: dialog});
    const close = dialog.getByRole('button', {name: 'Close'});
    await expect(close).toBeVisible();
    await expect(dialog.getByRole('button', {name: 'Cancel'})).toBeVisible();
});

test('FlowStateKeyDialog: preserves whitespace in string keys on Apply', async ({mount, page}) => {
    let applied: Record<string, string> | undefined;
    await mount(
        <FlowStateKeyStories.Fields
            columns={[{name: 'account', type: 'string'}]}
            values={{account: 'alice'}}
            onChange={(values) => {
                applied = values;
            }}
        />,
    );

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox').fill(' alice ');
    await dialog.getByRole('button', {name: 'Apply'}).click();

    await expect.poll(() => applied).toEqual({account: ' alice '});
});

test('FlowStateKeyDialog: applies unchanged values and an entirely empty key', async ({
    mount,
    page,
}) => {
    const applied: Array<Record<string, string>> = [];
    await mount(<FlowStateKeyStories.Narrow onChange={(values) => applied.push(values)} />);
    const edit = page.getByRole('button', {name: 'Edit fields'});
    await edit.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Apply'}).click();
    await expect(dialog).not.toBeVisible();
    await expect.poll(() => applied).toEqual([{account: 'alice'}]);
    await edit.click();
    await dialog.getByPlaceholder('string').fill('');
    await dialog.getByRole('button', {name: 'Apply'}).click();
    await expect(dialog).not.toBeVisible();
    await expect.poll(() => applied).toEqual([{account: 'alice'}, {account: ''}]);
});

test('FlowStateKeyDialog: validates partial keys and resets cancelled drafts and errors', async ({
    mount,
    page,
}) => {
    const applied: Array<Record<string, string>> = [];
    await mount(
        <FlowStateKeyStories.Narrow
            columns={[
                {name: 'account', type: 'string'},
                {name: 'region', type: 'int64'},
            ]}
            values={{account: 'alice', region: '42'}}
            onChange={(values) => applied.push(values)}
        />,
    );
    const edit = page.getByRole('button', {name: 'Edit fields'});
    await edit.click();
    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder('int64').fill('');
    await expect(dialog.getByRole('button', {name: 'Apply'})).toBeDisabled();
    await dialog.getByPlaceholder('int64').blur();
    await expect(dialog.getByText('Fill every key column or none')).toBeVisible();
    await dialog.getByPlaceholder('int64').fill('invalid');
    await dialog.getByPlaceholder('int64').blur();
    await expect(dialog.getByText('"region" expects an integer (int64)')).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel'}).click();
    await expect(dialog).not.toBeVisible();
    expect(applied).toEqual([]);
    await edit.click();
    await expect(dialog.getByPlaceholder('int64')).toHaveValue('42');
    await expect(dialog.getByText('"region" expects an integer (int64)')).toHaveCount(0);
    await expect(dialog.getByRole('button', {name: 'Apply'})).toBeEnabled();
    await dialog.getByPlaceholder('string').fill('discarded');
    await dialog.getByRole('button', {name: 'Close'}).click();
    await expect(dialog).not.toBeVisible();
    expect(applied).toEqual([]);
    await edit.click();
    await expect(dialog.getByPlaceholder('string')).toHaveValue('alice');
    await dialog.getByPlaceholder('string').fill('');
    await dialog.getByPlaceholder('int64').fill('');
    await dialog.getByRole('button', {name: 'Apply'}).click();
    await expect(dialog).not.toBeVisible();
    await expect.poll(() => applied).toEqual([{account: '', region: ''}]);
});
