import React from 'react';
import {http} from 'msw';

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

for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpec: tabs and grouped JSON patches ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        test.slow();
        const reads: Array<string> = [];
        await router.use(
            http.put('*/api/v4/flow_execute', async ({request}) => {
                const {flow_command} = requestParameters(request);
                if (flow_command === 'get-pipeline-dynamic-spec') {
                    const {view} = (await request.clone().json()) as {view: string};
                    reads.push(view);
                } else if (flow_command === 'get-pipeline-dynamic-spec-patches') {
                    reads.push('patches');
                }
            }),
            dynamicSpecHandler(),
        );
        await mount(<PipelineDynamicSpecStories.Patches />);
        await test.step('Effective remains readable without inline editing or blame', async () => {
            await expect(page.getByRole('radio', {name: 'Effective', exact: true})).toBeChecked();
            await expect(
                page.getByRole('button', {name: 'Edit dynamic specification'}),
            ).toBeVisible();
            await expect(page.getByRole('button', {name: /^Edit \//})).toHaveCount(0);
            expect(reads).toEqual(['effective']);
        });
        await test.step('Base and Patches show their own values', async () => {
            await page.getByRole('radio', {name: 'Base', exact: true}).click();
            await expect(page.getByText('1000', {exact: true}).first()).toBeVisible();
            expect(reads).toEqual(['effective', 'base']);
            await page.getByRole('radio', {name: 'Patches', exact: true}).click();
            await expect(page.getByRole('row').first().getByRole('cell')).toHaveText([
                'Patch ID',
                'Diff',
                'Comment',
                'Time',
            ]);
            expect(reads).toEqual(['effective', 'base', 'patches']);
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

test('PipelineDynamicSpec: old controller keeps legacy view', async ({mount, page, router}) => {
    await router.use(unsupportedHandler, legacyHandler);
    await mount(<PipelineDynamicSpecStories.Unsupported />);
    await expect(page.getByRole('button', {name: 'Edit dynamic specification'})).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(0);
    await expect(page.getByText('1002', {exact: true})).toBeVisible();
});

test('PipelineDynamicSpec: Edit reads and saves base without switching view', async ({
    mount,
    page,
    router,
}) => {
    const writes: Array<{parameters: unknown; body: unknown}> = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec') {
                const body = (await request.clone().json()) as {view: string};
                if (body.view === 'base')
                    return Response.json({version: 42, spec: snapshot.base_spec});
            }
            return;
        }),
        dynamicSpecHandler(),
        http.put('*/api/v4/set_pipeline_dynamic_spec', async ({request}) => {
            writes.push({parameters: requestParameters(request), body: await request.json()});
            return Response.json({});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Show preview', exact: true}).click();
    await expect(dialog).toContainText('1000');
    await expect(dialog).not.toContainText('1002');
    const edited = {computations: {noop: {batch_duration: 1003, max_rows_per_batch: 1000}}};
    const editor = dialog.getByRole('textbox', {name: 'Editor content'});
    await editor.focus();
    await expect(editor).toBeFocused();
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    await page.keyboard.press(`${modifier}+A`);
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(JSON.stringify(edited));
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect.poll(() => writes.length).toBe(1);
    expect(writes[0]).toMatchObject({parameters: {expected_version: 42}, body: edited});
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('radio', {name: 'Effective', exact: true})).toBeChecked();
});

test('PipelineDynamicSpec: failed base read does not open effective for editing', async ({
    mount,
    page,
    router,
}) => {
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (
                requestParameters(request).flow_command === 'get-pipeline-dynamic-spec' &&
                ((await request.clone().json()) as {view: string}).view === 'base'
            ) {
                return Response.json({code: 1, message: 'Cannot read base'}, {status: 500});
            }
            return;
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await expect(page.getByText('Cannot read base').first()).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
});
