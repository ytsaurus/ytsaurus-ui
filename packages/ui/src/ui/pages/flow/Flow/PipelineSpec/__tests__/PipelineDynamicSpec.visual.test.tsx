import React from 'react';
import {http} from 'msw';
import {type Page} from '@playwright/test';

import {expect, test} from '../../../../../playwright-components/core';
import {PipelineDynamicSpecStories} from '../__stories__';
import {
    PATCH_ID,
    VERSION,
    blameSnapshot,
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

test('PipelineDynamicSpec: effective patch blame', async ({mount, page, router}) => {
    await router.use(dynamicSpecHandler(blameSnapshot));
    await mount(<PipelineDynamicSpecStories.Blame />);
    const blame = page.locator('[data-qa="dynamic-spec-blame"]');
    await test.step('Only changed fields show the patch that supplied their effective value', async () => {
        await expect(blame).toHaveCount(3);
        await expect(blame.filter({hasText: PATCH_ID})).toHaveCount(1);
        await expect(blame.filter({hasText: VERSION})).toHaveCount(2);
        await expect(blame.filter({hasText: PATCH_ID})).toContainText('First patch');
        await expect(page.getByText('9', {exact: true})).toBeVisible();
        await expect(page.getByRole('button', {name: /^Edit \//})).toHaveCount(0);
    });
    await test.step('Ticket links are clickable and Patch ID follows the comment and time', async () => {
        const annotation = blame.filter({hasText: VERSION}).first();
        await expect(annotation.getByRole('link', {name: 'YTFRONT-6091'})).toHaveAttribute(
            'href',
            'https://st.yandex-team.ru/YTFRONT-6091',
        );
        await expect(annotation).not.toContainText('[YTFRONT-6091](');
        await expect(annotation).toHaveText(
            new RegExp(
                `^Second patch YTFRONT-6091\\s*\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\s*Patch ID: ${VERSION}$`,
            ),
        );
    });
    await test.step('Base has no patch blame', async () => {
        await page.getByRole('radio', {name: 'Base', exact: true}).click();
        await expect(page.getByText('1000', {exact: true}).first()).toBeVisible();
        await expect(blame).toHaveCount(0);
    });
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
                '',
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
    test(`PipelineDynamicSpec: specification spacing ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        await router.use(dynamicSpecHandler());
        await mount(<PipelineDynamicSpecStories.WithTabs />, {width: 1200});
        await page.getByRole('link', {name: 'Dynamic spec', exact: true}).click();
        const mainTabs = page.locator('.yt-flow__tabs');
        const views = page.getByRole('radiogroup');
        const toolbarButton = page.getByTestId('qa:structuredyson:expand-all');
        for (const view of ['Effective', 'Base', 'Effective']) {
            await page.getByRole('radio', {name: view, exact: true}).click();
            await expect(toolbarButton).toBeVisible();
            await expect
                .poll(async () => {
                    const tabsBox = await mainTabs.boundingBox();
                    const viewsBox = await views.boundingBox();
                    const toolbarBox = await toolbarButton.boundingBox();
                    return tabsBox && viewsBox && toolbarBox
                        ? {
                              belowTabs: Math.round(viewsBox.y - tabsBox.y - tabsBox.height),
                              aboveToolbar: Math.round(toolbarBox.y - viewsBox.y - viewsBox.height),
                          }
                        : undefined;
                })
                .toEqual({belowTabs: 20, aboveToolbar: 20});
        }
        await expectScreenshot({themes: [theme]});
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

for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpec: root Edit creates one minimal patch ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        test.slow();
        const calls: Array<{command: string; body: unknown}> = [];
        const effective = {
            computations: {noop: {batch_duration: 1002, max_rows_per_batch: 2000}},
            controller: {limit: 4, stable: 8},
        };
        await router.use(
            http.put('*/api/v4/flow_execute', async ({request}) => {
                if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec')
                    return;
                calls.push({command: 'patch', body: await request.json()});
                return Response.json({version: snapshot.version});
            }),
            dynamicSpecHandler({...snapshot, effective_spec: effective}),
            http.put('*/api/v4/set_pipeline_dynamic_spec', () => {
                calls.push({command: 'set', body: {}});
                return Response.json({});
            }),
        );
        await mount(<PipelineDynamicSpecStories.Patches />);
        await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('textbox', {name: 'Editor content'})).toBeAttached();
        await expect(dialog.getByText('"computations"', {exact: true})).toBeVisible();
        await dialog.getByRole('button', {name: 'Show preview', exact: true}).click();
        await expect(dialog).toContainText('1002');
        await expect(dialog).not.toContainText('1000');
        const comment =
            'Two runtime changes\n[YTFRONT-6091](https://st.yandex-team.ru/YTFRONT-6091)';
        await dialog.getByRole('textbox', {name: 'Comment'}).fill(comment);
        await expect(dialog.getByRole('button', {name: 'Confirm', exact: true})).toBeDisabled();
        await replaceEditorContent(
            page,
            JSON.stringify({
                ...effective,
                computations: {noop: {...effective.computations.noop, batch_duration: 1003}},
                controller: {limit: 5, stable: 8},
            }),
        );
        await expect(dialog).toContainText('1003');
        await dialog.getByRole('textbox', {name: 'Comment'}).focus();
        await dialog.getByRole('code').hover();
        await expectScreenshot({themes: [theme], component: dialog});
        await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toEqual({
            command: 'patch',
            body: {
                set_changes: [
                    {path: '/computations/noop/batch_duration', value: 1003},
                    {path: '/controller/limit', value: 5},
                ],
                comment,
                expected_version: snapshot.version,
            },
        });
        await expect(dialog).toHaveCount(0);
        await expect(page.getByRole('radio', {name: 'Effective', exact: true})).toBeChecked();
    });
}

test('PipelineDynamicSpec: old Controller still saves base through Set', async ({
    mount,
    page,
    router,
}) => {
    const calls: unknown[] = [];
    await router.use(
        unsupportedHandler,
        http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
            Response.json({version: 42, spec: snapshot.base_spec}),
        ),
        http.put('*/api/v4/set_pipeline_dynamic_spec', async ({request}) => {
            calls.push({parameters: requestParameters(request), body: await request.json()});
            return Response.json({});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Unsupported />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', {name: 'Comment'})).toHaveCount(0);
    const edited = {computations: {noop: {batch_duration: 1003, max_rows_per_batch: 1000}}};
    await replaceEditorContent(page, JSON.stringify(edited));
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect.poll(() => calls.length).toBe(1);
    expect(calls[0]).toMatchObject({parameters: {expected_version: 42}, body: edited});
});

test('PipelineDynamicSpec: failed fresh read does not open a stale editor', async ({
    mount,
    page,
    router,
}) => {
    let reads = 0;
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (
                requestParameters(request).flow_command === 'get-pipeline-dynamic-spec' &&
                ((await request.clone().json()) as {view: string}).view === 'effective' &&
                ++reads > 1
            ) {
                return Response.json(
                    {code: 1, message: 'Cannot read specification'},
                    {status: 500},
                );
            }
            return;
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await expect(page.getByText('Cannot read specification').first()).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('PipelineDynamicSpec: Cancel and Reset require confirmation', async ({
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
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(calls).toHaveLength(0);
    await page.getByRole('button', {name: 'Keep patch', exact: true}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(calls).toHaveLength(0);
    await page.getByRole('button', {name: `Cancel ${PATCH_ID}`, exact: true}).click();
    await page.getByRole('dialog').getByRole('button', {name: 'Cancel', exact: true}).click();
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

test('PipelineDynamicSpec: Cancel keeps its dialog and original version on failure', async ({
    mount,
    page,
    router,
}) => {
    const calls: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'cancel-pipeline-dynamic-spec-patch')
                return;
            calls.push(await request.json());
            return Response.json(
                {code: 1, message: 'Dynamic spec version mismatch'},
                {status: 500},
            );
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await page.getByRole('button', {name: `Cancel ${PATCH_ID}`, exact: true}).click();
    await page.evaluate(() => {
        (
            window as typeof window & {store: {dispatch: (action: unknown) => unknown}}
        ).store.dispatch({
            type: 'flow.dynamicSpec/onSuccess',
            payload: {
                data: {version: {$type: 'int64', $value: '1923307469208162015'}, patches: []},
                supported_features: ['dynamic_spec_patches'],
            },
        });
    });
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(dialog).toBeVisible();
    await expect(
        dialog.getByText('Dynamic spec version mismatch', {exact: false}).first(),
    ).toBeVisible();
    expect(calls).toEqual([
        {
            patch: snapshot.patches[0].patch_id,
            expected_version: snapshot.version,
        },
    ]);
    const errors = page.getByText('Dynamic spec version mismatch', {exact: true});
    expect(await errors.count()).toBeGreaterThan(0);
    expect(await dialog.getByText('Dynamic spec version mismatch', {exact: true}).count()).toBe(
        await errors.count(),
    );
    await dialog.getByRole('button', {name: 'Keep patch', exact: true}).click();
    await expect(dialog).toHaveCount(0);
});

test('PipelineDynamicSpec: Reset keeps its dialog and original version on failure', async ({
    mount,
    page,
    router,
}) => {
    const calls: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'reset-pipeline-dynamic-spec') return;
            calls.push(await request.json());
            return Response.json(
                {code: 1, message: 'Dynamic spec version mismatch'},
                {status: 500},
            );
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await page.getByRole('button', {name: 'Reset all patches', exact: true}).click();
    await page.evaluate(() => {
        (
            window as typeof window & {store: {dispatch: (action: unknown) => unknown}}
        ).store.dispatch({
            type: 'flow.dynamicSpec/onSuccess',
            payload: {
                data: {version: {$type: 'int64', $value: '1923307469208162015'}, patches: []},
                supported_features: ['dynamic_spec_patches'],
            },
        });
    });
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', {name: 'Reset all patches', exact: true}).click();
    await expect(dialog).toBeVisible();
    await expect(
        dialog.getByText('Dynamic spec version mismatch', {exact: false}).first(),
    ).toBeVisible();
    expect(calls).toEqual([
        {
            expected_version: snapshot.version,
        },
    ]);
    const errors = page.getByText('Dynamic spec version mismatch', {exact: true});
    expect(await errors.count()).toBeGreaterThan(0);
    expect(await dialog.getByText('Dynamic spec version mismatch', {exact: true}).count()).toBe(
        await errors.count(),
    );
    await dialog.getByRole('button', {name: 'Keep patches', exact: true}).click();
    await expect(dialog).toHaveCount(0);
});

for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpec: Cancel confirmation ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        await router.use(dynamicSpecHandler());
        await mount(<PipelineDynamicSpecStories.Patches />);
        await page.getByRole('radio', {name: 'Patches', exact: true}).click();
        await page.getByRole('button', {name: `Cancel ${PATCH_ID}`, exact: true}).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expectScreenshot({themes: [theme], component: page.getByRole('dialog')});
    });

    test(`PipelineDynamicSpec: Reset confirmation ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        await router.use(dynamicSpecHandler());
        await mount(<PipelineDynamicSpecStories.Patches />);
        await page.getByRole('radio', {name: 'Patches', exact: true}).click();
        await page.getByRole('button', {name: 'Reset all patches', exact: true}).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await expectScreenshot({themes: [theme], component: page.getByRole('dialog')});
    });
}

for (const theme of ['light', 'dark'] as const) {
    test(`PipelineDynamicSpec: Update edits grouped JSON and comment ${theme}`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        test.slow();
        await router.use(dynamicSpecHandler());
        await mount(<PipelineDynamicSpecStories.Patches />);
        await page.getByRole('radio', {name: 'Patches', exact: true}).click();
        await page.getByRole('button', {name: `Update ${PATCH_ID}`, exact: true}).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog.getByRole('textbox', {name: 'Editor content'})).toBeAttached();
        await expect(dialog.getByText('"computations"', {exact: true}).first()).toBeVisible();
        await dialog.getByRole('button', {name: 'Show preview', exact: true}).click();
        await expect(dialog).toContainText('computations');
        await expect(dialog).toContainText('1001');
        await expect(dialog).not.toContainText('max_rows_per_batch');
        await dialog.getByRole('textbox', {name: 'Comment'}).fill('Updated reason');
        await dialog.locator('.monaco-editor').hover();
        await expectScreenshot({themes: [theme], component: dialog});
    });
}

test('PipelineDynamicSpec: Update sends a comment-only change', async ({mount, page, router}) => {
    await router.use(dynamicSpecHandler());
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await page.getByRole('button', {name: `Update ${PATCH_ID}`, exact: true}).click();
    const dialog = page.getByRole('dialog');
    const comment = 'Updated reason\n[YTFRONT-6091](https://st.yandex-team.ru/YTFRONT-6091)';
    await dialog.getByRole('textbox', {name: 'Comment'}).fill(comment);
    const request = page.waitForRequest(
        (candidate) =>
            candidate.url().endsWith('/api/v4/flow_execute') &&
            candidate.postDataJSON()?.comment === comment,
    );
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    expect((await request).postDataJSON()).toEqual({
        patch: snapshot.patches[0].patch_id,
        expected_version: snapshot.version,
        comment,
    });
    await expect(dialog).toHaveCount(0);
});

test('PipelineDynamicSpec: Update replaces all changes of an existing patch', async ({
    mount,
    page,
    router,
}) => {
    const calls: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec') return;
            calls.push(await request.json());
            return Response.json({version: snapshot.version});
        }),
        dynamicSpecHandler(),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('radio', {name: 'Patches', exact: true}).click();
    await page.getByRole('button', {name: `Update ${VERSION}`, exact: true}).click();
    const dialog = page.getByRole('dialog');
    await replaceEditorContent(
        page,
        JSON.stringify({computations: {noop: {batch_duration: 1003, max_rows_per_batch: 3000}}}),
    );
    await dialog.getByRole('textbox', {name: 'Comment'}).fill('Value reason');
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect.poll(() => calls.length).toBe(1);
    expect(calls[0]).toEqual({
        patch: snapshot.patches[1].patch_id,
        expected_version: snapshot.version,
        comment: 'Value reason',
        set_changes: [
            {path: '/computations/noop/batch_duration', value: 1003},
            {path: '/computations/noop/max_rows_per_batch', value: 3000},
        ],
    });
});

test('PipelineDynamicSpec: Update keeps its captured patch and version after conflict', async ({
    mount,
    page,
    router,
}) => {
    const calls: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec') return;
            calls.push(await request.json());
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
    await page.evaluate(() => {
        (
            window as typeof window & {store: {dispatch: (action: unknown) => unknown}}
        ).store.dispatch({
            type: 'flow.dynamicSpec/onSuccess',
            payload: {
                data: {version: {$type: 'int64', $value: '1923307469208162015'}, patches: []},
                supported_features: ['dynamic_spec_patches'],
            },
        });
    });
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', {name: 'Comment'}).fill('Updated reason');
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect(dialog.getByText('Dynamic spec version mismatch').first()).toBeVisible();
    expect(calls).toEqual([
        {
            patch: snapshot.patches[0].patch_id,
            expected_version: snapshot.version,
            comment: 'Updated reason',
        },
    ]);
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(dialog).toHaveCount(0);
});

for (const createPatch of [true, false]) {
    test(`PipelineDynamicSpec: open draft keeps mode when feature becomes ${!createPatch}`, async ({
        mount,
        page,
        router,
    }) => {
        let supported = createPatch;
        const calls: Array<{command: string; parameters?: unknown; body: unknown}> = [];
        await router.use(
            http.put('*/api/v4/flow_execute', async ({request}) => {
                const command = requestParameters(request).flow_command;
                if (command === 'get-supported-features')
                    return Response.json(supported ? ['dynamic_spec_patches'] : []);
                if (command === 'patch-pipeline-dynamic-spec') {
                    calls.push({command: 'patch', body: await request.json()});
                    return Response.json({version: 43});
                }
                if (command === 'get-pipeline-dynamic-spec')
                    return Response.json({version: 42, spec: snapshot.effective_spec});
                return undefined;
            }),
            dynamicSpecHandler(),
            http.put('*/api/v4/set_pipeline_dynamic_spec', async ({request}) => {
                calls.push({
                    command: 'set',
                    parameters: requestParameters(request),
                    body: await request.json(),
                });
                return Response.json({});
            }),
            http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
                Response.json({version: 42, spec: snapshot.effective_spec}),
            ),
        );
        await mount(
            createPatch ? (
                <PipelineDynamicSpecStories.Patches />
            ) : (
                <PipelineDynamicSpecStories.NoPatchFeature />
            ),
        );
        await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
        const dialog = page.getByRole('dialog');
        await replaceEditorContent(
            page,
            '{"computations":{"noop":{"batch_duration":1003,"max_rows_per_batch":2000}}}',
        );
        if (createPatch) await dialog.getByRole('textbox', {name: 'Comment'}).fill('Frozen reason');
        supported = !createPatch;
        await page.evaluate((feature) => {
            (
                window as typeof window & {store: {dispatch: (action: unknown) => unknown}}
            ).store.dispatch({
                type: 'flow.dynamicSpec/onSuccess',
                payload: {
                    supported_features: feature ? ['dynamic_spec_patches'] : [],
                    data: {
                        version: 43,
                        spec: {
                            computations: {noop: {batch_duration: 1004, max_rows_per_batch: 2000}},
                        },
                    },
                },
            });
        }, supported);
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('textbox', {name: 'Comment'})).toHaveCount(
            createPatch ? 1 : 0,
        );
        await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect.poll(() => calls.length).toBe(1);
        expect(calls[0]).toMatchObject(
            createPatch
                ? {
                      command: 'patch',
                      body: {
                          expected_version: {$type: 'int64', $value: '42'},
                          comment: 'Frozen reason',
                          set_changes: [{path: '/computations/noop/batch_duration', value: 1003}],
                      },
                  }
                : {
                      command: 'set',
                      parameters: {expected_version: 42},
                      body: {
                          computations: {noop: {batch_duration: 1003, max_rows_per_batch: 2000}},
                      },
                  },
        );
        await expect(dialog).toHaveCount(0);
    });
}

test('PipelineDynamicSpec: create conflict keeps the draft without fallback Set', async ({
    mount,
    page,
    router,
}) => {
    const calls: string[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec') return;
            calls.push('patch');
            return Response.json(
                {code: 1, message: 'Dynamic spec version mismatch'},
                {status: 500},
            );
        }),
        dynamicSpecHandler(),
        http.put('*/api/v4/set_pipeline_dynamic_spec', () => {
            calls.push('set');
            return Response.json({});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    const dialog = page.getByRole('dialog');
    await replaceEditorContent(
        page,
        '{"computations":{"noop":{"batch_duration":1003,"max_rows_per_batch":2000}}}',
    );
    await dialog.getByRole('textbox', {name: 'Comment'}).fill('Keep this draft');
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect(dialog.getByText('Dynamic spec version mismatch').first()).toBeVisible();
    await expect(dialog.getByRole('textbox', {name: 'Comment'})).toHaveValue('Keep this draft');
    expect(calls).toEqual(['patch']);
});

for (const [name, edited, error] of [
    [
        'parameter deletion',
        {computations: {noop: {batch_duration: 1002}}},
        'Deleting dynamic specification parameters',
    ],
    ['map deletion', {}, 'Deleting dynamic specification parameters'],
    [
        'lifecycle change',
        {
            computations: {noop: {batch_duration: 1002, max_rows_per_batch: 2000}},
            target_state: 'paused',
        },
        'Use pipeline lifecycle controls',
    ],
] as const) {
    test(`PipelineDynamicSpec: root Edit rejects ${name} before sending changes`, async ({
        mount,
        page,
        router,
    }) => {
        const calls: unknown[] = [];
        await router.use(
            http.put('*/api/v4/flow_execute', async ({request}) => {
                if (requestParameters(request).flow_command !== 'patch-pipeline-dynamic-spec')
                    return;
                calls.push(await request.json());
                return Response.json({});
            }),
            dynamicSpecHandler(),
        );
        await mount(<PipelineDynamicSpecStories.Patches />);
        await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
        const dialog = page.getByRole('dialog');
        await replaceEditorContent(page, JSON.stringify(edited));
        await dialog.getByRole('textbox', {name: 'Comment'}).fill('Rejected edit');
        await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect(dialog.getByText(error, {exact: false}).first()).toBeVisible();
        expect(calls).toHaveLength(0);
    });
}

test('PipelineDynamicSpec: discovery failure does not enable legacy editing', async ({
    mount,
    page,
    router,
}) => {
    const legacyReads: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', () =>
            Response.json({code: 1, message: 'Access denied'}, {status: 500}),
        ),
        http.get('*/api/v4/get_pipeline_dynamic_spec', () => {
            legacyReads.push('read');
            return Response.json({version: 42, spec: {}});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Patches />);
    await expect(page.getByText('Access denied').first()).toBeVisible();
    await expect(page.getByRole('button', {name: 'Edit dynamic specification'})).toBeDisabled();
    expect(legacyReads).toHaveLength(0);
});
