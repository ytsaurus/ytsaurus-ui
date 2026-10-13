import React from 'react';
import type {
    FlowDeleteStatesBody,
    FlowReadStatesBody,
    FlowReadStatesResponse,
} from '../../../../../../../shared/yt-types';
import {TYPED_INPUT_FORMAT, TYPED_OUTPUT_FORMAT} from '../../../../../../constants';
import {expect, test} from '../../../../../../playwright-components/core';
import {FlowStateSectionStories} from '../__stories__';
import {createStateReadHandlers, stateResponse} from '../__stories__/mocks';

test('FlowStateSection: debounces filters and ignores a late response', async ({
    mount,
    page,
    router,
    expectScreenshot,
}) => {
    await page.setViewportSize({width: 1480, height: 900});
    const requests: Array<FlowReadStatesBody> = [];
    let releaseSlow!: (value: FlowReadStatesResponse) => void;
    const slow = new Promise<FlowReadStatesResponse>((resolve) => {
        releaseSlow = resolve;
    });
    await router.use(
        ...createStateReadHandlers(async (body) => {
            requests.push(body);
            return body.name === '/slow' ? slow : stateResponse(body.name ?? '/initial');
        }),
    );
    await mount(<FlowStateSectionStories.Default />);
    const table = page.getByRole('table');
    await expect(table.getByText('/initial', {exact: true})).toBeVisible();
    const name = page.getByRole('textbox', {name: 'State', exact: true});
    await expect(page.getByRole('button', {name: 'Delete state row'})).toBeAttached();
    const clockTime = new Date('2026-01-01T00:00:00Z');
    await page.clock.install({time: clockTime});
    await page.clock.pauseAt(clockTime);
    await name.fill('/discarded');
    await page.clock.runFor(100);
    await name.fill('/slow');
    await expect(page.getByRole('status')).toHaveText('Refreshing states');
    expect(requests).toHaveLength(1);
    await page.clock.runFor(500);
    await expect.poll(() => requests.map(({name: state}) => state)).toEqual([undefined, '/slow']);
    await expect(table.getByText('/initial', {exact: true})).toBeVisible();
    const staleFilter = table.getByRole('button', {name: '/initial', exact: true});
    await staleFilter.focus();
    await expect(staleFilter).not.toBeFocused();
    await expect(staleFilter.click({timeout: 300})).rejects.toThrow();
    await expect(name).toHaveValue('/slow');
    await expectScreenshot({nameSuffix: 'refreshing'});
    await name.fill('/latest');
    await page.clock.runFor(500);
    await expect(table.getByText('/latest', {exact: true})).toBeVisible();
    const lateResponse = page.waitForResponse(
        async (response) =>
            response.url().includes('/flow_execute') &&
            response.request().postDataJSON()?.name === '/slow',
    );
    releaseSlow(stateResponse('/slow'));
    await lateResponse;
    await page.clock.runFor(500);
    await expect(table.getByText('/slow', {exact: true})).toHaveCount(0);
    await expect(table.getByText('/latest', {exact: true})).toBeVisible();
    await expect(page.getByRole('status')).toHaveCount(0);
    expect(requests.map(({name: state}) => state)).toEqual([undefined, '/slow', '/latest']);
    await expectScreenshot({nameSuffix: 'latest'});
});

test('FlowStateSection: sends typed formats and renders normalized annotated values', async ({
    mount,
    page,
    router,
    expectScreenshot,
}) => {
    const requests: Array<{body: FlowReadStatesBody; parameters: Record<string, unknown>}> = [];
    await router.use(
        ...createStateReadHandlers(
            async (body, parameters) => {
                requests.push({body, parameters});
                return {
                    key_states: [
                        {
                            computation_id: {$type: 'string', $value: 'checkout'},
                            key: [
                                {$type: 'uint64', $value: '9007199254740993'},
                                {$type: 'string', $value: 'ÐÐµÐ½Ð¸Ðº'},
                            ],
                            states: {'/counter': {$type: 'int64', $value: '9223372036854775807'}},
                        },
                    ],
                } as unknown as FlowReadStatesResponse;
            },
            {
                spec: {
                    computations: {
                        checkout: {
                            group_by_schema: [
                                {name: 'id', type: 'uint64'},
                                {name: 'label', type: 'string'},
                            ],
                        },
                    },
                },
            },
        ),
    );
    await mount(
        <FlowStateSectionStories.Default
            fixedComputationId="checkout"
            initialFilters={{
                target: 'key_state',
                keyValues: {id: '9007199254740993', label: 'Веник'},
            }}
        />,
    );
    const table = page.getByRole('table');
    await expect(table.getByText('/counter', {exact: true})).toBeVisible();
    await expect(table).toContainText('9007199254740993');
    await expect(table).toContainText('Веник');
    await expect(table).toContainText('9223372036854775807');
    await expect.poll(() => requests.some(({body}) => body.key !== undefined)).toBe(true);
    const keyedRequest = requests.find(({body}) => body.key !== undefined);
    expect(keyedRequest?.body).toEqual({
        computation_id: 'checkout',
        limit: 10,
        target: 'key_state',
        key: {id: {$type: 'uint64', $value: '9007199254740993'}, label: 'Веник'},
    });
    for (const {parameters} of requests) {
        expect(parameters.input_format).toEqual(TYPED_INPUT_FORMAT);
        expect(parameters.output_format).toEqual(TYPED_OUTPUT_FORMAT);
    }
    await expect(page.getByRole('status')).toHaveCount(0);
    await table.getByRole('row').last().hover();
    await table.getByRole('button', {name: 'Delete state row'}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('table')).toContainText(
        '"$type":"uint64","$value":"9007199254740993"',
    );
    await dialog.getByRole('button', {name: 'Cancel'}).click();
    await page.mouse.move(0, 0);
    await expectScreenshot({component: table});
});

test('FlowStateSection: deletion refreshes every active read for the pipeline', async ({
    mount,
    page,
    router,
    expectScreenshot,
}) => {
    const reads: Array<FlowReadStatesBody> = [];
    const deletes: Array<FlowDeleteStatesBody> = [];
    let deleted = false;
    await router.use(
        ...createStateReadHandlers(
            async (body) => {
                reads.push(body);
                return {
                    key_states: [
                        {
                            computation_id: body.computation_id,
                            key: ['alice'],
                            states: {
                                [deleted ? '/after' : '/before']: {events: deleted ? 8 : 7},
                            },
                        },
                    ],
                } as FlowReadStatesResponse;
            },
            {
                spec: {
                    computations: {
                        checkout: {group_by_schema: [{name: 'account', type: 'string'}]},
                        archive: {group_by_schema: [{name: 'account', type: 'string'}]},
                    },
                },
                onDelete: (body) => {
                    deletes.push(body);
                    deleted = true;
                },
            },
        ),
    );
    await mount(<FlowStateSectionStories.ActiveComputations />);
    const checkout = page.getByRole('region', {name: 'Checkout states'});
    const archive = page.getByRole('region', {name: 'Archive states'});
    await expect(checkout.getByRole('table')).toContainText('/before');
    await expect(archive.getByRole('table')).toContainText('/before');
    const before = reads.length;
    const checkoutReads = reads.filter(({computation_id}) => computation_id === 'checkout').length;
    const archiveReads = reads.filter(({computation_id}) => computation_id === 'archive').length;
    await checkout.getByRole('table').getByRole('row').last().hover();
    await checkout.getByRole('button', {name: 'Delete state row'}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Delete', exact: true}).click();
    await expect(dialog).not.toBeVisible();
    await expect(checkout.getByRole('table')).toContainText('/after');
    await expect(archive.getByRole('table')).toContainText('/after');
    expect(deletes).toEqual([
        {
            computation_id: 'checkout',
            key: ['alice'],
            name: '/before',
            target: 'key_state',
            force: false,
            commit: true,
        },
    ]);
    expect(reads.length).toBeGreaterThanOrEqual(before + 2);
    expect(
        reads.filter(({computation_id}) => computation_id === 'checkout').length,
    ).toBeGreaterThan(checkoutReads);
    expect(reads.filter(({computation_id}) => computation_id === 'archive').length).toBeGreaterThan(
        archiveReads,
    );
    await expect(checkout.getByRole('table')).not.toContainText('/before');
    await expect(archive.getByRole('table')).not.toContainText('/before');
    await page.mouse.move(0, 0);
    await expectScreenshot({component: checkout});
});
