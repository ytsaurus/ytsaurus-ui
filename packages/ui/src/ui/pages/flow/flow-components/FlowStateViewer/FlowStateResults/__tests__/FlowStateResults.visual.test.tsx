import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateResultsStories} from '../__stories__';

test('FlowStateResults: Populated', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Populated />);
    await expectScreenshot();
});

test('FlowStateResults: sorts rows by state name', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const stateHeader = page.locator(
        '.gt-table__header-cell_id_state-name .column-header__label-icon',
    );

    await expect(page.locator('.gt-table__cell_id_state-name').first()).toContainText('/counter');
    await stateHeader.click();
    await stateHeader.click();
    await expect(page.locator('.gt-table__cell_id_state-name').first()).toContainText('/window');
});

test('FlowStateResults: Populated with a hovered row', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const row = page.locator('.yt-gravity-table__row').first();
    await row.hover();

    await expectScreenshot();
});

test('FlowStateResults: Read only', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.ReadOnly />);
    await expectScreenshot();
});

test('FlowStateResults: No scope', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.NoScope />);
    await expectScreenshot();
});

test('FlowStateResults: Loading', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Loading />);
    await expectScreenshot();
});

test('FlowStateResults: Refreshing', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.Refreshing />);
    await expect(page.getByRole('status')).toHaveText('Refreshing states');
    await expectScreenshot();
});

test('FlowStateResults: Successful empty response', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.SuccessfulEmpty />);
    await expectScreenshot();
});

test('FlowStateResults: Transport error', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.TransportError />);
    await expectScreenshot();
});

test('FlowStateResults: Response error', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.ResponseError />);
    await expectScreenshot();
});

test('FlowStateResults: Narrow long content', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.NarrowLongContent />, {width: 480});
    await expectScreenshot();
});

test('FlowStateResults: filterable Key omits its hash and copy actions are keyboard reachable', async ({
    mount,
    page,
}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const keyCell = page.locator('.gt-table__cell_id_key').first();
    const valueCell = page.locator('.gt-table__cell_id_value').first();
    const keyCopy = page.getByRole('button', {name: 'Copy key'}).first();
    const valueCopy = page.getByRole('button', {name: 'Copy value'}).first();

    await expect(keyCell).toContainText('["4506162232340681623","checkout"]');
    await expect(keyCell).not.toContainText('hash-not-filterable');
    await expect(keyCell.getByRole('button', {name: 'Copy key'})).toBeAttached();
    await expect(valueCell.getByRole('button', {name: 'Copy value'})).toBeAttached();
    for (const button of [keyCopy, valueCopy]) {
        for (let i = 0; i < 20; i++) {
            await page.keyboard.press('Tab');
            if (await button.evaluate((node) => node === document.activeElement)) {
                break;
            }
        }
        await expect(button).toBeFocused();
    }
});

test('FlowStateResults: unresolved Key remains verbatim without a copy action', async ({
    mount,
    page,
}) => {
    await mount(<FlowStateResultsStories.UnresolvableKey />);

    await expect(page.locator('.gt-table__cell_id_key')).toContainText('hash-not-resolvable');
    await expect(page.getByRole('button', {name: 'Copy key'})).toHaveCount(0);
});

test('FlowStateResults: row navigation and deletion remain operable', async ({mount, page}) => {
    let deletedRows = 0;
    await mount(
        <FlowStateResultsStories.Populated
            onDeleteRows={(rows) => {
                deletedRows += rows.length;
            }}
        />,
    );
    const row = page.locator('.yt-gravity-table__row').first();
    const actions = row.locator('.gt-table__cell_id_actions');

    await expect(actions.getByRole('link', {name: 'Open computation page'})).toHaveAttribute(
        'href',
        '/hahn/flows/computations/state/state',
    );
    await expect(actions.getByRole('link', {name: 'Open backing storage'})).toHaveAttribute(
        'href',
        /home\/flow\/pipeline\/state/,
    );
    await expect(
        page
            .locator('.yt-gravity-table__row')
            .nth(1)
            .locator('.gt-table__cell_id_actions')
            .getByRole('button', {name: 'Show value'}),
    ).toBeAttached();
    const deleteButton = actions.getByRole('button', {name: 'Delete state row'});
    await deleteButton.focus();
    await deleteButton.press('Enter');
    await expect.poll(() => deletedRows).toBe(1);
});

test('FlowStateResults: read-only rows omit selection and delete controls', async ({
    mount,
    page,
}) => {
    await mount(<FlowStateResultsStories.ReadOnly />);

    await expect(page.getByRole('checkbox')).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Delete state row'})).toHaveCount(0);
    const actions = page.locator('.gt-table__cell_id_actions').first();
    const showValue = page
        .locator('.gt-table__cell_id_actions')
        .nth(1)
        .getByRole('button', {name: 'Show value'});
    await expect(actions.getByRole('link')).toHaveCount(2);
    await expect(showValue).toBeAttached();
});

test('FlowStateResults: result actions are disabled while refreshing', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.RefreshingActions />);
    await expect(page.getByRole('button', {name: 'Show raw response'})).toBeDisabled();
    await expect(page.getByRole('button', {name: 'About bounded results'})).toBeDisabled();
});

test('FlowStateResults: result actions are hidden without scope', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.HiddenActions />);
    await expect(page.getByRole('button', {name: 'Show raw response'})).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'About bounded results'})).toHaveCount(0);
});

test('FlowStateResults: Narrow delete remains keyboard reachable', async ({mount, page}) => {
    let deletedRows = 0;
    await mount(
        <FlowStateResultsStories.NarrowLongContent
            onDeleteRows={(rows) => {
                deletedRows += rows.length;
            }}
        />,
        {width: 480},
    );
    const deleteButton = page.getByRole('button', {name: 'Delete state row'});
    for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        if (await deleteButton.evaluate((node) => node === document.activeElement)) {
            break;
        }
    }
    await expect(deleteButton).toBeFocused();
    await deleteButton.press('Enter');
    await expect.poll(() => deletedRows).toBe(1);
});

test('FlowStateResults: Refreshing rows are inert', async ({mount, page}) => {
    const selectedRowId =
        'key_state|state||["hash-not-filterable","4506162232340681623","checkout"]|/counter';
    await mount(<FlowStateResultsStories.Refreshing rowSelection={{[selectedRowId]: true}} />);
    const content = page.locator('[data-testid="results-content"]');
    const deleteButton = page.getByRole('button', {name: 'Delete state row'}).first();
    const bulkDeleteButton = page.getByRole('button', {name: 'Delete', exact: true});
    const status = page.getByRole('status');

    await expect(content).toHaveAttribute('inert', '');
    await expect(status).toHaveAttribute('aria-live', 'polite');
    expect(
        await content.evaluate((node) => !node.contains(document.querySelector('[role="status"]'))),
    ).toBe(true);
    for (const action of [bulkDeleteButton, deleteButton]) {
        await action.focus();
        await expect(action).not.toBeFocused();
        await expect(action.click({timeout: 500})).rejects.toThrow();
    }
});
