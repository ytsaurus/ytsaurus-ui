import React from 'react';
import {composeStories} from '@storybook/react';
import {http} from 'msw';
import {type Page} from '@playwright/test';
import {expect, test} from '../../../../../playwright-components/core';
import * as stories from '../__stories__/PipelineDynamicSpecEditor.stories';
import {
    dynamicSpecEditorHandler,
    effective,
    requestParameters,
    version,
} from '../__stories__/editor-mocks';
const Stories = composeStories(stories);
async function replaceEditor(page: Page, spec: unknown) {
    const editor = page.getByRole('dialog').getByRole('textbox', {name: 'Editor content'});
    await editor.focus();
    await expect(editor).toBeFocused();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(JSON.stringify(spec, null, 4));
}
for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpecEditor: multi-path root edit ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        test.slow();
        const calls: Array<unknown> = [];
        await router.use(
            http.put('*/api/v4/flow_execute', async ({request}) => {
                if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec')
                    return;
                calls.push(await request.json());
                return Response.json({version, patch_id: version});
            }),
            dynamicSpecEditorHandler(),
        );
        await mount(<Stories.Effective />);
        await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
        const changed = {
            ...effective,
            computations: {noop: {...effective.computations.noop, batch_duration: 1500}},
            job_manager: {resource_limits: {user_slots: 3}},
        };
        await replaceEditor(page, changed);
        await expect(page.getByRole('button', {name: 'Confirm', exact: true})).toBeDisabled();
        await page.getByRole('textbox', {name: 'Comment'}).fill('Tune batch and capacity');
        await expect(page.getByRole('button', {name: 'Confirm', exact: true})).toBeEnabled();
        await expectScreenshot({component: page.getByRole('dialog'), themes: [theme]});
        await page.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toEqual({
            set_changes: [
                {path: '/computations/noop/batch_duration', value: 1500},
                {path: '/job_manager/resource_limits/user_slots', value: 3},
            ],
            comment: 'Tune batch and capacity',
            expected_version: version,
        });
        await expect(page.getByRole('dialog')).toHaveCount(0);
    });
}
test('PipelineDynamicSpecEditor: rejects field removal and lifecycle edits before sending', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const calls: Array<unknown> = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec') return;
            calls.push(await request.json());
            return Response.json({version});
        }),
        dynamicSpecEditorHandler(),
    );
    await mount(<Stories.Effective />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await page.getByRole('textbox', {name: 'Comment'}).fill('Tune');
    await replaceEditor(page, {
        computations: effective.computations,
        target_state: effective.target_state,
    });
    await page.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect(
        page.getByText(
            'Deleting fields is not supported. Restore the removed fields before saving.',
            {exact: true},
        ),
    ).toBeVisible();
    expect(calls).toHaveLength(0);
    await replaceEditor(page, {...effective, target_state: 'stopped'});
    await page.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect(
        page.getByText('Use the pipeline lifecycle controls to change target_state.', {
            exact: true,
        }),
    ).toBeVisible();
    expect(calls).toHaveLength(0);
});
test('PipelineDynamicSpecEditor: conflict refresh preserves draft and original version', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const calls: Array<unknown> = [];
    let refreshed = false;
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const {flow_command} = requestParameters(request);
            if (flow_command === 'get-pipeline-dynamic-spec-patches')
                return Response.json({version, patches: []});
            if (flow_command === 'get-pipeline-dynamic-spec')
                return Response.json({
                    version: refreshed ? '1923307469208162015' : version,
                    spec: refreshed ? {...effective, extra: 123} : effective,
                });
            calls.push(await request.json());
            refreshed = true;
            return Response.json({code: 1, message: 'DynamicSpec version mismatch'}, {status: 500});
        }),
    );
    await mount(<Stories.Effective />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await replaceEditor(page, {...effective, job_manager: {resource_limits: {user_slots: 4}}});
    await page.getByRole('textbox', {name: 'Comment'}).fill('My draft');
    await page.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect(page.getByText('DynamicSpec version mismatch', {exact: true})).toBeVisible();
    await expect(page.getByRole('textbox', {name: 'Comment'})).toHaveValue('My draft');
    await expect(page.getByText('1923307469208162015', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect.poll(() => calls.length).toBe(2);
    expect(calls[1]).toEqual(calls[0]);
    expect(calls[1]).toMatchObject({
        expected_version: version,
        set_changes: [{path: '/job_manager/resource_limits/user_slots', value: 4}],
    });
});
test('PipelineDynamicSpecEditor: old controller keeps the legacy editor', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    await router.use(
        http.put('*/api/v4/flow_execute', () =>
            Response.json(
                {code: 1, message: 'No such command: get-pipeline-dynamic-spec-patches.'},
                {status: 500},
            ),
        ),
        http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
            Response.json({version, spec: effective}),
        ),
    );
    await mount(<Stories.Effective />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await expect(page.getByRole('textbox', {name: 'Comment'})).toHaveCount(0);
    await expect(
        page.getByRole('dialog').getByRole('textbox', {name: 'Editor content'}),
    ).toBeVisible();
});
