import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateResultsStories} from '../__stories__';

test('FlowStateResults: Populated', async ({mount, expectScreenshot}) => {
    await mount(<FlowStateResultsStories.Populated />);
    await expectScreenshot();
});

test('FlowStateResults: table starts without a utility-action spacer', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const results = page.locator('.yt-flow-state-results');
    const table = page.locator('.yt-flow-state-results__table-pane');
    const [resultsBox, tableBox] = await Promise.all([results.boundingBox(), table.boundingBox()]);

    expect(resultsBox).not.toBeNull();
    expect(tableBox).not.toBeNull();
    expect((tableBox?.y ?? 0) - (resultsBox?.y ?? 0)).toBeLessThan(48);
});

test('FlowStateResults: table fills the available width', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />, {width: 1440});
    const pane = page.locator('.yt-flow-state-results__table-pane');
    const lastCell = page.locator('.yt-gravity-table__row').first().locator('td').last();
    const [paneBox, lastCellBox] = await Promise.all([pane.boundingBox(), lastCell.boundingBox()]);

    expect(paneBox).not.toBeNull();
    expect(lastCellBox).not.toBeNull();
    expect(
        Math.abs(
            (paneBox?.x ?? 0) +
                (paneBox?.width ?? 0) -
                ((lastCellBox?.x ?? 0) + (lastCellBox?.width ?? 0)),
        ),
    ).toBeLessThan(2);
});

test('FlowStateResults: Key column reserves room for multipart keys', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />, {width: 1440});
    const keyCell = page.locator('.gt-table__cell_id_key').first();
    const keyCellBox = await keyCell.boundingBox();

    expect(keyCellBox).not.toBeNull();
    expect(keyCellBox?.width ?? 0).toBeGreaterThanOrEqual(240);
});

test('FlowStateResults: sortable columns use shared headers', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const headers = page.locator('.gt-table__header-cell .column-header');
    const stateHeader = page.locator(
        '.gt-table__header-cell_id_state-name .column-header__label-icon',
    );

    await expect(headers).toHaveCount(6);
    await expect(page.locator('.gt-table__cell_id_state-name').first()).toContainText('/counter');
    await stateHeader.click();
    await stateHeader.click();
    await expect(page.locator('.gt-table__cell_id_state-name').first()).toContainText('/window');
});

test('FlowStateResults: Populated with a hovered row', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const row = page.locator('.yt-gravity-table__row').first();
    await row.hover();

    const keyCopy = row.getByRole('button', {name: 'Copy key'});
    const valueCopy = row.getByRole('button', {name: 'Copy value'});
    const copyGap = (copyButton: HTMLElement) => {
        const wrapper = copyButton.closest('.yt-flow-state-results__hover-action');
        const value = wrapper?.previousElementSibling;
        if (!wrapper || !value) {
            throw new Error('Copy action must immediately follow its value.');
        }
        return wrapper.getBoundingClientRect().x - value.getBoundingClientRect().right;
    };

    expect(await keyCopy.evaluate(copyGap)).toBeLessThanOrEqual(4);
    expect(await valueCopy.evaluate(copyGap)).toBeLessThanOrEqual(4);

    const actionsCell = row.locator('.gt-table__cell_id_actions');
    const actionBoxes = await actionsCell
        .locator('.yt-flow-state-results__hover-action')
        .evaluateAll((actions) => actions.map((action) => action.getBoundingClientRect().toJSON()));
    expect(actionBoxes.map(({width}) => width)).toEqual(actionBoxes.map(() => 24));
    expect(actionBoxes.slice(1).map(({x}, index) => x - (actionBoxes[index].x + 24))).toEqual(
        actionBoxes.slice(1).map(() => 4),
    );

    const iconColors = await actionsCell
        .locator('.g-icon')
        .evaluateAll((icons) => icons.map((icon) => getComputedStyle(icon).color));
    expect(new Set(iconColors).size).toBe(1);
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
    await expect(
        page.locator('.gt-table__header-cell_id_computation .column-header__loader'),
    ).toBeVisible();
    await expect(page.locator('.yt-flow-state-results__content-loader')).toHaveCount(0);
    await expectScreenshot();
});

test('FlowStateResults: Successful empty response', async ({mount, expectScreenshot, page}) => {
    await mount(<FlowStateResultsStories.SuccessfulEmpty />);
    const empty = page.locator('.yt-flow-state-results__empty');
    const content = empty.locator('.no-content');
    const [emptyBox, contentBox] = await Promise.all([empty.boundingBox(), content.boundingBox()]);

    expect(emptyBox).not.toBeNull();
    expect(contentBox).not.toBeNull();
    expect(
        Math.abs(
            (emptyBox?.y ?? 0) +
                (emptyBox?.height ?? 0) / 2 -
                ((contentBox?.y ?? 0) + (contentBox?.height ?? 0) / 2),
        ),
    ).toBeLessThan(2);
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
    await keyCopy.focus();
    await expect(keyCopy).toBeFocused();
    await valueCopy.focus();

    await expect(valueCopy).toBeFocused();
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

test('FlowStateResults: row actions reveal on hover and keyboard focus', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const row = page.locator('.yt-gravity-table__row').nth(1);
    const actions = row.locator('.yt-flow-state-results__hover-action');
    const actionsCell = row.locator('.gt-table__cell_id_actions');
    const idleBackground = await row.evaluate((node) => getComputedStyle(node).backgroundColor);

    await expect(actions.first()).toHaveCSS('opacity', '0');
    await expect(actions.first()).toHaveCSS('pointer-events', 'none');
    await row.hover();
    await expect(actions.first()).toHaveCSS('opacity', '1');
    await expect(actions.first()).toHaveCSS('pointer-events', 'auto');
    const hoveredBackground = await row.evaluate((node) => getComputedStyle(node).backgroundColor);
    expect(hoveredBackground).not.toBe(idleBackground);
    await expect(actionsCell).toHaveCSS('background-color', hoveredBackground);
    await page.mouse.move(0, 0);
    await row.getByRole('button', {name: 'Show value'}).focus();
    await expect(actions.first()).toHaveCSS('opacity', '1');
    await expect(actionsCell).toHaveCSS('background-color', hoveredBackground);
});

test('FlowStateResults: selecting a row does not leave row actions visible', async ({
    mount,
    page,
}) => {
    await mount(<FlowStateResultsStories.Populated />);
    const row = page.locator('.yt-gravity-table__row').first();
    const actions = row.locator('.yt-flow-state-results__hover-action');

    await row.getByRole('checkbox').click();
    await page.mouse.move(0, 0);

    await expect(actions.first()).toHaveCSS('opacity', '0');
    await expect(actions.first()).toHaveCSS('pointer-events', 'none');
});

test('FlowStateResults: Narrow delete remains keyboard reachable', async ({mount, page}) => {
    await mount(<FlowStateResultsStories.NarrowLongContent />, {width: 480});
    const deleteButton = page.getByRole('button', {name: 'Delete state row'});

    await expect(deleteButton).toBeInViewport();
    await deleteButton.focus();
    await expect(deleteButton).toBeFocused();
    await deleteButton.press('Enter');
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
