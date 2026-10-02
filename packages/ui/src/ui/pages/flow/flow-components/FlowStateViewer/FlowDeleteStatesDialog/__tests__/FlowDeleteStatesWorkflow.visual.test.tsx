import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';
import {TYPED_INPUT_FORMAT} from '../../../../../../constants';
import type {FlowDeleteStatesBody} from '../../../../../../../shared/yt-types';
import {FlowDeleteStatesWorkflowStories} from '../__stories__';
import {createDeleteWorkflowHandlers} from '../__stories__/workflow-mocks';

test('FlowDeleteStatesWorkflow: submits typed rows and closes after success', async ({
    mount,
    page,
    router,
    expectScreenshot,
}) => {
    const requests: Array<FlowDeleteStatesBody> = [];
    const requestParameters: Array<Record<string, unknown>> = [];
    const commits: Array<boolean> = [];
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
        release = resolve;
    });
    await router.use(
        ...createDeleteWorkflowHandlers({
            onDelete: (body, parameters) => {
                requests.push(body);
                requestParameters.push(parameters);
            },
            beforeDelete: () => pending,
        }),
    );
    await mount(
        <FlowDeleteStatesWorkflowStories.Success
            onCommitted={(_outcomes, allCommitted) => {
                commits.push(allCommitted);
            }}
        />,
    );
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Delete', exact: true}).click();
    await expect.poll(() => requests.length).toBe(1);
    await expect(dialog.getByRole('button', {name: 'Cancel'})).toBeDisabled();
    await page.mouse.move(0, 0);
    await expectScreenshot({component: dialog, nameSuffix: 'pending'});
    release();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Deleted rows: 2');
    expect(requests).toEqual([
        {
            computation_id: 'checkout',
            key: [{$type: 'uint64', $value: '7'}, 'ключ'],
            name: '/first',
            target: 'key_state',
            force: false,
            commit: true,
        },
        {
            computation_id: 'checkout',
            key: [{$type: 'uint64', $value: '8'}, 'ключ'],
            name: '/second',
            target: 'key_state',
            force: false,
            commit: true,
        },
    ]);
    expect(requestParameters).toHaveLength(2);
    for (const parameters of requestParameters) {
        expect(parameters.input_format).toEqual(TYPED_INPUT_FORMAT);
        expect(parameters.input_format).toMatchObject({$attributes: {encode_utf8: false}});
        expect(parameters.output_format).toBeUndefined();
    }
    expect(commits).toEqual([true]);
});

test('FlowDeleteStatesWorkflow: retries only failed rows after a partial failure', async ({
    mount,
    page,
    router,
    expectScreenshot,
}) => {
    const requests: Array<FlowDeleteStatesBody> = [];
    const commits: Array<boolean> = [];
    await router.use(
        ...createDeleteWorkflowHandlers({
            failSecond: true,
            onDelete: (body) => requests.push(body),
        }),
    );
    await mount(
        <FlowDeleteStatesWorkflowStories.PartialFailure
            onCommitted={(_outcomes, allCommitted) => {
                commits.push(allCommitted);
            }}
        />,
    );
    const dialog = page.getByRole('dialog');
    const submit = dialog.getByRole('button', {name: 'Delete', exact: true});
    await submit.click();
    await expect(dialog.getByText('Deleted 1 of 2 selected rows')).toBeVisible();
    await expect(dialog.getByText('Deletion did not complete')).toBeVisible();
    await expect(submit).toBeEnabled();
    await page.mouse.move(0, 0);
    await expectScreenshot({component: dialog});
    await submit.click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Deleted rows: 2');
    expect(requests.map(({name}) => name)).toEqual(['/first', '/second', '/second']);
    expect(commits).toEqual([false, true]);
});
