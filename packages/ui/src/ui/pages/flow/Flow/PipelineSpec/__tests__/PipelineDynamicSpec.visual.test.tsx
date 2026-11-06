import React from 'react';
import {http} from 'msw';
import {type Page} from '@playwright/test';

import {expect, test} from '../../../../../playwright-components/core';
import {PipelineDynamicSpecStories} from '../__stories__';
import {
    PATCH_ID,
    VERSION,
    dynamicSpecHandler,
    largePatchSnapshot,
    legacyHandler,
    markdownHandler,
    requestParameters,
    snapshot,
    unsupportedHandler,
} from '../__stories__/mocks';

test.beforeEach(async ({router}) => {
    await router.use(markdownHandler);
});

async function replaceEditorContent(page: Page, text: string) {
    const editor = page.getByRole('dialog').getByRole('textbox', {name: 'Editor content'});
    await editor.focus();
    await expect(editor).toBeFocused();
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    await page.keyboard.press(`${modifier}+A`);
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(text);
}

for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpec: tabs and grouped JSON patches ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        test.slow();
        await router.use(dynamicSpecHandler());
        await mount(<PipelineDynamicSpecStories.Patches />);
        await test.step('Effective remains readable without inline editing or blame', async () => {
            await expect(page.getByRole('radio', {name: 'Effective', exact: true})).toBeChecked();
            await expect(
                page.getByRole('button', {name: 'Edit dynamic specification'}),
            ).toBeVisible();
            await expect(page.getByRole('button', {name: /^Edit \//})).toHaveCount(0);
        });
        await test.step('Base and Patches show their own values', async () => {
            await page.getByRole('radio', {name: 'Base', exact: true}).click();
            await expect(page.getByText('1000', {exact: true}).first()).toBeVisible();
            await page.getByRole('radio', {name: 'Patches', exact: true}).click();
            await expect(page.getByRole('row').first().getByRole('cell')).toHaveText([
                'Patch ID',
                'Diff',
                'Comment',
                'Time',
                'Actions',
            ]);
            const first = page.getByRole('row').filter({hasText: PATCH_ID});
            const second = page.getByRole('row').filter({hasText: VERSION});
            await expect(first).toContainText('1001');
            await expect(first).not.toContainText('max_rows_per_batch');
            await expect(second).toContainText('1002');
            await expect(second).toContainText('max_rows_per_batch');
            await expect(second.getByRole('link', {name: 'YTFRONT-6091'})).toBeVisible();
            await expectScreenshot({themes: [theme]});
        });
    });
}

for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpec: full-width table and complete large patch ${theme}`, async ({
        mount,
        page,
        expectScreenshot,
        router,
    }) => {
        test.slow();
        await router.use(dynamicSpecHandler(largePatchSnapshot));
        await page.setViewportSize({width: 1280, height: 1100});
        await mount(<PipelineDynamicSpecStories.LargePatch />);
        await page.getByRole('radio', {name: 'Patches', exact: true}).click();
        const table = page.getByRole('table');
        const diff = page.locator('.yt-flow-dynamic-spec__diff').first();
        await expect(diff).toContainText('option_23');
        const initialDiffWidth = await diff.evaluate(
            (element) => element.getBoundingClientRect().width,
        );
        await page.setViewportSize({width: 1800, height: 1100});
        await expect
            .poll(
                async () =>
                    (await diff.evaluate((element) => element.getBoundingClientRect().width)) -
                    initialDiffWidth,
            )
            .toBeGreaterThan(500);
        const dimensions = await table.evaluate((element) => ({
            width: element.getBoundingClientRect().width,
            availableWidth: element.parentElement?.getBoundingClientRect().width ?? 0,
        }));
        expect(Math.abs(dimensions.width - dimensions.availableWidth)).toBeLessThanOrEqual(1);
        const content = await diff.evaluate((element) => ({
            height: element.clientHeight,
            scrollHeight: element.scrollHeight,
            width: element.clientWidth,
            scrollWidth: element.scrollWidth,
        }));
        expect(content.height).toBeGreaterThan(300);
        expect(content.scrollHeight).toBeLessThanOrEqual(content.height + 1);
        expect(content.scrollWidth).toBeLessThanOrEqual(content.width + 1);
        await expectScreenshot({themes: [theme]});
    });
}

test('PipelineDynamicSpec: Update sends a comment-only update or the complete edited diff', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const calls: Array<Record<string, unknown>> = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec') return;
            calls.push((await request.json()) as Record<string, unknown>);
            return Response.json({version: snapshot.version});
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await test.step('Changing only the reason omits set_changes', async () => {
        await page.getByRole('button', {name: `Update ${VERSION}`, exact: true}).click();
        await page.getByRole('textbox', {name: 'Comment'}).fill('New reason');
        await page.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toEqual({
            patch: snapshot.version,
            expected_version: snapshot.version,
            comment: 'New reason',
        });
    });
    await test.step('Changing a value preserves all paths and the patch ID', async () => {
        await page.getByRole('button', {name: `Update ${VERSION}`, exact: true}).click();
        await replaceEditorContent(
            page,
            JSON.stringify({
                computations: {noop: {batch_duration: 1003, max_rows_per_batch: 2000}},
            }),
        );
        await page.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect.poll(() => calls.length).toBe(2);
        expect(calls[1]).toMatchObject({
            patch: snapshot.version,
            expected_version: snapshot.version,
            set_changes: [
                {path: '/computations/noop/batch_duration', value: 1003},
                {path: '/computations/noop/max_rows_per_batch', value: 2000},
            ],
        });
    });
});

test('PipelineDynamicSpec: Cancel targets a patch and Reset requires confirmation', async ({
    mount,
    page,
    router,
}) => {
    const calls: Array<{command: string; body: unknown}> = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const command = requestParameters(request).flow_command;
            if (
                !['cancel-pipeline-dynamic-spec-patch', 'reset-pipeline-dynamic-spec'].includes(
                    command,
                )
            )
                return;
            calls.push({command, body: await request.json()});
            return Response.json({version: snapshot.version});
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await page.getByRole('button', {name: `Cancel ${PATCH_ID}`, exact: true}).click();
    await expect.poll(() => calls.length).toBe(1);
    expect(calls[0]).toEqual({
        command: 'cancel-pipeline-dynamic-spec-patch',
        body: {patch: {$type: 'int64', $value: PATCH_ID}, expected_version: snapshot.version},
    });
    const reset = page.getByRole('button', {name: 'Reset all patches', exact: true});
    await reset.click();
    await expect(page.getByRole('button', {name: 'Keep patches', exact: true})).toBeVisible();
    expect(calls).toHaveLength(1);
    await page.getByRole('button', {name: 'Keep patches', exact: true}).click();
    expect(calls).toHaveLength(1);
    await reset.click();
    await page
        .getByRole('dialog')
        .getByRole('button', {name: 'Reset all patches', exact: true})
        .click();
    await expect.poll(() => calls.length).toBe(2);
    expect(calls[1]).toEqual({
        command: 'reset-pipeline-dynamic-spec',
        body: {expected_version: snapshot.version},
    });
});

test('PipelineDynamicSpec: Update keeps its draft and original version during refresh', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const calls: Array<Record<string, unknown>> = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec') return;
            calls.push((await request.json()) as Record<string, unknown>);
            return Response.json(
                {code: 1, message: 'Dynamic spec version mismatch'},
                {status: 500},
            );
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await page.getByRole('button', {name: `Update ${PATCH_ID}`, exact: true}).click();
    await replaceEditorContent(
        page,
        JSON.stringify({computations: {noop: {batch_duration: 1003}}}),
    );
    const later = {...snapshot, version: {$type: 'int64' as const, $value: '1923307469208162015'}};
    await page.evaluate((state) => {
        (
            window as typeof window & {store: {dispatch: (action: unknown) => unknown}}
        ).store.dispatch({
            type: 'flow.dynamicSpec/onSuccess',
            payload: {
                data: {
                    spec: state.effective_spec,
                    version: state.version,
                    dynamic_spec_state: state,
                },
            },
        });
    }, later);
    await expect(page.getByText('Version: 1923307469208162015', {exact: true})).toBeVisible();
    await page.getByRole('dialog').getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect.poll(() => calls.length).toBe(1);
    expect(calls[0]).toMatchObject({
        expected_version: snapshot.version,
        set_changes: [{path: '/computations/noop/batch_duration', value: 1003}],
    });
    await expect(
        page.getByRole('dialog').getByText('Dynamic spec version mismatch', {exact: false}).first(),
    ).toBeVisible();
});

test('PipelineDynamicSpec: old controllers retain the existing editor', async ({
    mount,
    page,
    router,
}) => {
    await router.use(unsupportedHandler, legacyHandler);
    await mount(<PipelineDynamicSpecStories.Unsupported />);
    await expect(page.getByRole('button', {name: 'Edit dynamic specification'})).toBeEnabled();
    await expect(page.getByRole('radio', {name: 'Patches', exact: true})).toHaveCount(0);
});

test('PipelineDynamicSpec: a failed read is not an empty patch list', async ({
    mount,
    page,
    router,
}) => {
    await router.use(
        http.put('*/api/v4/flow_execute', () =>
            Response.json({code: 1, message: 'Access denied'}, {status: 500}),
        ),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await expect(page.getByText('Access denied', {exact: true}).first()).toBeVisible();
    await expect(page.getByRole('radio', {name: 'Patches', exact: true})).toHaveCount(0);
});
