import React from 'react';
import {type Page} from '@playwright/test';
import {http} from 'msw';

import {
    type FlowDynamicSpecOverride,
    type FlowDynamicSpecSnapshot,
} from '../../../../../../shared/yt-types';

import {expect, test} from '../../../../../playwright-components/core';
import {PipelineDynamicSpecStories} from '../__stories__';
import {
    MAP_VERSION,
    NEWER_VERSION,
    OWNER_VERSION,
    PIPELINE_PATH,
    RAW_UNICODE_KEY,
    demoMap,
    dynamicSpecHandler,
    dynamicSpecSnapshot,
    failedDynamicSpecHandler,
    legacyDynamicSpecHandler,
    unavailableDynamicSpecHandler,
    unicodeGroup,
} from '../__stories__/mocks';

test('PipelineDynamicSpec: base effective and override provenance', async ({
    mount,
    page,
    router,
    expectScreenshot,
}) => {
    test.slow();
    await router.use(dynamicSpecHandler);
    await mount(<PipelineDynamicSpecStories.Overrides />);

    await expect(page.getByRole('radio', {name: 'Effective', exact: true})).toBeChecked();
    await expect(page.getByRole('button', {name: 'Edit dynamic specification'})).toBeVisible();
    await expect(page.getByText('Edit', {exact: true})).toHaveCount(0);
    await expect(page.locator(`[data-owner-version="${NEWER_VERSION}"]`).first()).toContainText(
        'Новая CPU квота',
    );
    await page.mouse.wheel(0, 1000);
    await expect(page.getByText('Runtime', {exact: true})).toBeVisible();
    await page.mouse.wheel(0, -1000);
    await expect(
        page.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}).first(),
    ).toBeVisible();
    await expect(page.getByText('Default', {exact: true})).toHaveCount(0);
    await expect(page.locator('.yt-flow-dynamic-spec__attribution_source_base')).toHaveCount(0);
    await expect(page.locator('[data-dynamic-spec-override]').first()).toBeVisible();
    const expectOverrideColors = async () => {
        for (const theme of ['light', 'dark'] as const) {
            await page.evaluate((nextTheme) => {
                document.body.classList.remove('theme-light', 'theme-dark');
                document.body.classList.add(`theme-${nextTheme}`);
            }, theme);
            await page.emulateMedia({colorScheme: theme});
            await expect(page.locator('body')).toHaveClass(
                new RegExp(`g-root_theme_${theme}(?:\\s|$)`),
            );
            const positive = await page.evaluate(() => {
                const probe = document.createElement('span');
                probe.style.color = 'var(--g-color-text-positive)';
                document.querySelector('.yt-flow-dynamic-spec')?.append(probe);
                const color = getComputedStyle(probe).color;
                probe.remove();
                return color;
            });
            await expect(
                page.getByRole('button', {
                    name: 'Edit /job_manager/resource_limits/cpu',
                    exact: true,
                }),
            ).toHaveCSS('color', positive);
            await expect(
                page.getByRole('button', {
                    name: 'Edit /computations/noop/max_rows_per_batch',
                    exact: true,
                }),
            ).not.toHaveCSS('color', positive);
            for (const [path, token] of [
                ['/throttlers/ui_demo/limit', '.double'],
                ['/throttlers/ui_demo/period', '.number, .int64'],
                ['/job_manager/resource_limits/cpu', '.int64'],
                ['/owned_counter', '.uint64'],
            ]) {
                await expect(
                    page
                        .getByRole('button', {name: `Edit ${path}`, exact: true})
                        .locator(token)
                        .first(),
                ).toHaveCSS('color', positive);
            }
            for (const path of [
                '/throttlers/ui_demo/rpc_timeout',
                '/throttlers/ui_demo/retrying_channel/max_attempts',
            ]) {
                const value = page.getByRole('button', {name: `Edit ${path}`, exact: true});
                await expect(value).not.toHaveAttribute('data-dynamic-spec-override');
                await expect(value.locator('.number, .int64').first()).not.toHaveCSS(
                    'color',
                    positive,
                );
                await expect(value.locator('..').locator('[data-owner-version]')).toHaveCount(0);
            }
            for (const path of [
                '/throttlers',
                '/throttlers/ui_demo/classes',
                '/throttlers/ui_demo/retrying_channel',
            ]) {
                const value = page.getByRole('button', {name: `Edit ${path}`, exact: true}).first();
                await expect(value).not.toHaveAttribute('data-dynamic-spec-override');
                await expect(value.locator('..').locator('[data-owner-version]')).toHaveCount(0);
            }
            await expect(
                page
                    .getByRole('button', {
                        name: 'Edit /job_manager/resource_limits/user_slots',
                        exact: true,
                    })
                    .locator('.number, .int64')
                    .first(),
            ).not.toHaveCSS('color', positive);
        }
        await page.evaluate(() => {
            document.body.classList.remove('theme-dark');
            document.body.classList.add('theme-light');
        });
        await page.emulateMedia({colorScheme: 'light'});
        await expect(page.locator('body')).toHaveClass(/g-root_theme_light(?:\s|$)/);
    };
    await expectOverrideColors();
    await expect(page.getByText('"dynamic_spec_state"', {exact: true})).toHaveCount(0);
    expect(
        await page
            .locator('.yt-flow-dynamic-spec__attribution_compact')
            .evaluateAll((items) =>
                items.every((item) => item.getBoundingClientRect().height <= 24),
            ),
    ).toBe(true);

    await page.getByRole('radio', {name: 'Base', exact: true}).check();
    await expect(page.getByRole('button', {name: 'Edit dynamic specification'})).toHaveCount(0);
    await expect(page.locator('[data-owner-version]')).toHaveCount(0);
    await expect(page.locator('.yt-flow-dynamic-spec__attribution')).toHaveCount(0);
    await expect(page.locator('[data-dynamic-spec-value]')).toHaveCount(0);
    await expect(page.getByRole('button', {name: /^Edit \//})).toHaveCount(0);

    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    const removed = page
        .getByRole('row')
        .filter({hasText: /^\/job_manager\/resource_limitsReplace map/});
    await expect(
        page.getByRole('row').filter({hasText: '/job_manager/resource_limits/memory'}),
    ).toHaveCount(0);
    await expect(removed.locator('[data-owner-version]')).toHaveAttribute(
        'title',
        new RegExp(OWNER_VERSION),
    );
    await expect(removed).not.toContainText(OWNER_VERSION);
    await expect(removed).toContainText('2026-10-05 08:48:47 UTC');
    await expect(removed).toContainText('Демо override для проверки вкладки Dynamic Spec.');
    await expect(removed).not.toContainText('.000000Z');
    const inherited = page
        .getByRole('row')
        .filter({hasText: '/job_manager/resource_limits/user_slots'});
    await expect(inherited).toContainText('Base value');
    await expect(inherited.locator('[data-owner-version]')).toHaveCount(0);
    await expect(inherited.getByRole('button', {name: /^Cancel /})).toHaveCount(0);
    await expect(inherited.locator('td').nth(5)).toHaveText('—');
    const cpu = page.getByRole('row').filter({hasText: '/job_manager/resource_limits/cpu'});
    await expect(cpu.locator('[data-owner-version]')).toHaveAttribute(
        'title',
        new RegExp(NEWER_VERSION),
    );
    await expect(cpu).not.toContainText(NEWER_VERSION);
    await expect(cpu).toContainText('Новая CPU квота');
    await expect(
        cpu
            .locator('td')
            .nth(2)
            .getByRole('button', {name: 'Edit /job_manager/resource_limits/cpu', exact: true}),
    ).toHaveText('2');
    await expect(cpu.getByRole('button', {name: 'Update map', exact: true})).toHaveCount(0);
    await expect(page.getByRole('button', {name: 'Cancel change', exact: true})).toHaveCount(0);
    expect(dynamicSpecSnapshot.base_spec).toMatchObject({job_manager: {resource_limits: {cpu: 2}}});
    const mask = page.getByRole('row').filter({hasText: /^\/mask/});
    await expect(mask).toContainText('Deletion mask');
    await expect(mask).toContainText('—');
    await expect(page.getByRole('row').filter({hasText: /^\/empty/})).toContainText('Replace map');
    await expect(page.getByRole('row').filter({hasText: /^\/missing/})).toContainText('Remove');
    await expect(page.getByText('Runtime target state: completed.', {exact: false})).toBeVisible();
    await expect(page.locator('thead th').filter({hasText: /^Patch$/})).toBeVisible();
    await expect(page.locator('thead th').filter({hasText: /^Actions$/})).toHaveCount(0);
    await expect(page.locator('thead th')).toHaveCount(6);
    await expect(page.locator('thead th')).toHaveText([
        'Path',
        'Operation',
        'Value',
        'Comment',
        'Time',
        'Patch',
    ]);
    await expect(page.getByRole('button', {name: 'Update map', exact: true})).toHaveCount(0);
    await expect(removed.locator('td').nth(3)).toHaveText(
        'Демо override для проверки вкладки Dynamic Spec.',
    );
    await expect(removed.locator('td').nth(4)).toHaveText('2026-10-05 08:48:47 UTC');
    await expect(page.locator('.yt-flow-dynamic-spec__patch')).toHaveCount(0);
    await expect(
        page
            .locator('.yt-flow-dynamic-spec__patches')
            .getByRole('button', {name: 'Cancel patch', exact: true}),
    ).toHaveCount(0);
    for (const row of await page.locator('tbody tr').all()) {
        if (await row.locator('[data-owner-version]').count()) {
            await expect(
                row.locator('td').nth(5).getByRole('button', {name: 'Cancel patch', exact: true}),
            ).toBeVisible();
        }
    }
    await expect(
        page.getByRole('button', {name: 'Reset all overrides', exact: true}),
    ).toBeVisible();
    await expect(
        cpu.getByRole('button', {name: 'Edit /job_manager/resource_limits/cpu', exact: true}),
    ).toHaveText('2');
    await expect(page.getByText('Edit', {exact: true})).toHaveCount(0);
    await expect(page.getByText('Inherit base', {exact: true})).toHaveCount(0);
    const tableRight = await page
        .locator('.yt-flow-dynamic-spec__overrides')
        .evaluate((element) => element.getBoundingClientRect().right);
    for (const path of ['/throttlers/ui_demo', '/unicode_group']) {
        const row = page.locator('tbody tr').filter({
            has: page.getByRole('button', {name: `Edit ${path}`, exact: true}),
        });
        for (const name of [`Edit ${path}`, 'Cancel patch']) {
            const bounds = await row.getByRole('button', {name, exact: true}).boundingBox();
            if (!bounds) {
                throw new Error(`${name} for ${path} is not rendered`);
            }
            expect(bounds.x + bounds.width).toBeLessThanOrEqual(tableRight + 1);
        }
    }

    await expect(cpu.getByRole('button', {name: 'Cancel patch', exact: true})).toHaveAttribute(
        'title',
        new RegExp(`Cancel all remaining changes from this patch\\nVersion: ${NEWER_VERSION}`),
    );
    for (const [name, suffix] of [
        ['Effective', 'effective'],
        ['Base', 'base'],
        ['Overrides', 'overrides'],
    ]) {
        await page.getByRole('radio', {name, exact: true}).check();
        if (name === 'Effective') {
            await expectOverrideColors();
        }
        await expectScreenshot({nameSuffix: suffix});
    }
});

test('PipelineDynamicSpec: unsupported controller preserves editing', async ({
    mount,
    page,
    router,
}) => {
    await router.use(unavailableDynamicSpecHandler, legacyDynamicSpecHandler);
    await mount(<PipelineDynamicSpecStories.UnsupportedController />);
    await expect(
        page.getByText('This controller does not support override provenance.', {exact: false}),
    ).toBeVisible();
    await expect(page.getByRole('button', {name: 'Edit dynamic specification'})).toBeVisible();
    await expect(page.getByRole('radio', {name: 'Overrides', exact: true})).toHaveCount(0);
});

test('PipelineDynamicSpec: errors never become empty overrides', async ({mount, page, router}) => {
    await router.use(failedDynamicSpecHandler);
    await mount(<PipelineDynamicSpecStories.RequestError />);
    await expect(page.getByText('Access denied', {exact: false}).first()).toBeVisible();
    await expect(page.getByText('No active user overrides.')).toHaveCount(0);
    await expect(page.getByRole('radio', {name: 'Overrides', exact: true})).toHaveCount(0);
});

function requestParameters(request: Request) {
    const encoded = [...request.headers.entries()]
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value)
        .join('');
    return JSON.parse(
        request.headers.get('x-yt-parameters') ?? Buffer.from(encoded, 'base64').toString('utf8'),
    );
}

const exactVersion = {$type: 'int64', $value: NEWER_VERSION} as const;

const humanEffectiveSpec = {
    ...(dynamicSpecSnapshot.effective_spec as {
        computations: {noop: {empty_batch_backoff: number}};
    }),
    unicode_group: {changed: 1, label: 'Квота 😊', binary: '\xff', Квота: 3},
};

async function replaceEditorContent(page: Page, text: string, verifyDraft = false) {
    const dialog = page.getByRole('dialog');
    await dialog
        .locator('.monaco-editor .monaco-scrollable-element.editor-scrollable')
        .click({position: {x: 20, y: 20}});
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    await page.keyboard.press(`${modifier}+A`);
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(text);
    if (verifyDraft) {
        await expect.poll(() => editorJSON(page)).toEqual(JSON.parse(text));
    }
    await expect(dialog.getByText('JSON Parse error:', {exact: false})).toHaveCount(0);
}

async function applyEditor(page: Page, comment = 'Update value') {
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', {name: 'Comment', exact: true}).fill(comment);
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
}

async function editorText(page: Page) {
    const editor = page.getByRole('dialog').getByRole('textbox', {name: 'Editor content'});
    await editor.focus();
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    await page.keyboard.press(`${modifier}+A`);
    let text: string;
    if (page.context().browser()?.browserType().name() === 'chromium') {
        // Chromium's native EditContext exposes a div, rather than a textarea.
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.keyboard.press(`${modifier}+C`);
        text = await page.evaluate(() => navigator.clipboard.readText());
    } else {
        text = await editor.inputValue();
    }
    return text;
}

async function editorJSON(page: Page) {
    const text = await editorText(page);
    try {
        return JSON.parse(text);
    } catch {
        return {unparsedEditorText: text};
    }
}

function snapshotWithDemo(
    children: Record<string, FlowDynamicSpecOverride>,
): FlowDynamicSpecSnapshot {
    return {
        ...dynamicSpecSnapshot,
        effective_spec: {
            ...(dynamicSpecSnapshot.effective_spec as Record<string, unknown>),
            throttlers: {
                ui_demo: {
                    ...demoMap,
                    limit: children.limit?.value ?? demoMap.limit,
                    rpc_timeout: 10000,
                    classes: {},
                    retrying_channel: {},
                },
            },
        },
        override_spec: {
            operation: 'map',
            children: {
                ...dynamicSpecSnapshot.override_spec.children,
                throttlers: {
                    operation: 'map',
                    children: {
                        ui_demo: {
                            operation: 'map',
                            version: {$type: 'int64', $value: MAP_VERSION},
                            value: {},
                            children: {
                                limit: {
                                    operation: 'set',
                                    version: {$type: 'int64', $value: MAP_VERSION},
                                    value: demoMap.limit,
                                },
                                period: {
                                    operation: 'set',
                                    version: {$type: 'int64', $value: MAP_VERSION},
                                    value: demoMap.period,
                                },
                                ...children,
                            },
                        },
                    },
                },
            },
        },
    };
}

test('PipelineDynamicSpec: separate audit columns keep multiline map values clickable', async ({
    mount,
    page,
    router,
}) => {
    await router.use(dynamicSpecHandler);
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    await expect(page.locator('thead th')).toHaveText([
        'Path',
        'Operation',
        'Value',
        'Comment',
        'Time',
        'Patch',
    ]);
    const row = page.locator('tbody tr').filter({hasText: /^\/throttlers\/ui_demoReplace map/});
    await expect(row.locator('td').nth(3)).toHaveText('Map demo: limit and period cancel together');
    await expect(row.locator('td').nth(4)).toHaveText('2026-10-05 17:01:04 UTC');
    const value = row.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true});
    expect(await value.locator('pre').innerText()).toMatch(/\n\s*"period"/);
    await value.locator('.number, .int64').click();
    await expect(
        page.getByRole('dialog').getByText('/throttlers/ui_demo', {exact: true}),
    ).toBeVisible();
    await expect.poll(() => editorJSON(page)).toEqual(demoMap);
});

test('PipelineDynamicSpec: grouped map edits only its raw intent without normalized defaults', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(dynamicSpecSnapshot);
            }
            mutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    const rows = page.locator('tbody tr').filter({hasText: '/throttlers/ui_demo'});
    await expect(rows).toHaveCount(1);
    await expect(rows.locator('[data-owner-version]')).toHaveAttribute(
        'data-owner-version',
        MAP_VERSION,
    );
    await expect(page.getByRole('button', {name: 'Cancel change', exact: true})).toHaveCount(0);
    const value = rows.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true});
    await expect(rows.getByRole('button', {name: 'Update map', exact: true})).toHaveCount(0);
    const rendered = await value.locator('pre').innerText();
    expect(rendered).toMatch(/\n\s*"limit"/);
    expect(rendered).toMatch(/\n\s*"period"/);
    await value.click();
    await expect.poll(() => editorJSON(page)).toEqual(demoMap);
    await replaceEditorContent(page, JSON.stringify(demoMap));
    await page
        .getByRole('dialog')
        .getByRole('textbox', {name: 'Comment', exact: true})
        .fill('Unchanged map');
    await expect(
        page.getByRole('dialog').getByRole('button', {name: 'Confirm', exact: true}),
    ).toBeDisabled();
    await page.getByRole('dialog').getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(mutations).toEqual([]);
    await value.focus();
    await value.press('Enter');
    await expect.poll(() => editorJSON(page)).toEqual(demoMap);
    await replaceEditorContent(page, JSON.stringify({...demoMap, period: 1500}));
    await page
        .getByRole('dialog')
        .getByRole('textbox', {name: 'Comment', exact: true})
        .fill('Период map 😊');
    await page.getByRole('dialog').getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                path: '/throttlers/ui_demo',
                spec: {...demoMap, period: 1500},
                expected_version: exactVersion,
                comment: Buffer.from('Период map 😊', 'utf8').toString('latin1'),
            },
        ]);
});

test('PipelineDynamicSpec: mixed map keeps separate child attribution and preserves its value in parent edits', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const state = snapshotWithDemo({limit: {operation: 'set', version: exactVersion, value: 2000}});
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(state);
            }
            mutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    await expect(page.locator('tbody tr').filter({hasText: '/throttlers/ui_demo'})).toHaveCount(2);
    const parent = page.locator('tbody tr').filter({hasText: /^\/throttlers\/ui_demoReplace map/});
    await expect(parent.locator('td').nth(2)).toContainText('period');
    await expect(parent.locator('td').nth(2)).not.toContainText('limit');
    await expect(parent.locator('[data-owner-version]')).toHaveAttribute(
        'data-owner-version',
        MAP_VERSION,
    );
    const child = page.locator('tbody tr').filter({hasText: /^\/throttlers\/ui_demo\/limit/});
    await expect(child.locator('[data-owner-version]')).toHaveAttribute(
        'data-owner-version',
        NEWER_VERSION,
    );
    await parent
        .getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true})
        .locator('.number, .int64')
        .click();
    await expect(
        page.getByRole('dialog').getByText('/throttlers/ui_demo', {exact: true}),
    ).toBeVisible();
    await expect.poll(() => editorJSON(page)).toEqual({limit: 2000, period: 1000});
    await replaceEditorContent(page, JSON.stringify({limit: 2000, period: 1500}));
    await applyEditor(page);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                path: '/throttlers/ui_demo',
                spec: {limit: 2000, period: 1500},
                expected_version: exactVersion,
                comment: 'Update value',
            },
        ]);
});

test('PipelineDynamicSpec: inherited map fields stay out of the draft and warn before replacement', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const state = snapshotWithDemo({
        nested: {operation: 'map', children: {follow_base: {operation: 'inherit'}}},
    });
    state.base_spec = {
        ...(state.base_spec as Record<string, unknown>),
        throttlers: {ui_demo: {nested: {follow_base: 99}}},
    };
    state.effective_spec = {
        ...(state.effective_spec as Record<string, unknown>),
        throttlers: {ui_demo: {...demoMap, nested: {follow_base: 99}, rpc_timeout: 10000}},
    };
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(state);
            }
            mutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    const parent = page.locator('tbody tr').filter({hasText: /^\/throttlers\/ui_demoReplace map/});
    const hole = page
        .locator('tbody tr')
        .filter({hasText: /^\/throttlers\/ui_demo\/nested\/follow_base/});
    await expect(hole.locator('td').nth(2)).toHaveText('99');
    await expect(hole.getByRole('button', {name: 'Cancel patch', exact: true})).toHaveCount(0);
    await parent.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}).click();
    const warning =
        'This map currently inherits some fields from the base. Replacing the whole map stops inheriting those fields. Include them explicitly to keep their current values.';
    await expect(page.getByRole('dialog')).toContainText(warning);
    await expect.poll(() => editorJSON(page)).toEqual(demoMap);
    await replaceEditorContent(page, JSON.stringify(demoMap));
    await page
        .getByRole('dialog')
        .getByRole('textbox', {name: 'Comment', exact: true})
        .fill('Unchanged map');
    await expect(
        page.getByRole('dialog').getByRole('button', {name: 'Confirm', exact: true}),
    ).toBeDisabled();
    await page.getByRole('dialog').getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(mutations).toEqual([]);
    await page.getByRole('radio', {name: 'Effective', exact: true}).check();
    const map = page.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}).first();
    await expect(map).toHaveAttribute('aria-disabled', 'false');
    await map.focus();
    await map.press('Enter');
    await expect(page.getByRole('dialog')).toContainText(warning);
    await expect.poll(() => editorJSON(page)).toEqual(demoMap);
    await replaceEditorContent(page, JSON.stringify({...demoMap, period: 1500}), true);
    await applyEditor(page);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                path: '/throttlers/ui_demo',
                spec: {...demoMap, period: 1500},
                expected_version: exactVersion,
                comment: 'Update value',
            },
        ]);
});

test('PipelineDynamicSpec: removed scalar starts from the displayed effective default', async ({
    mount,
    page,
    router,
}) => {
    const state = snapshotWithDemo({period: {operation: 'remove', version: exactVersion}});
    state.effective_spec = {
        ...(state.effective_spec as Record<string, unknown>),
        throttlers: {ui_demo: {...demoMap, period: 10000}},
    };
    await router.use(http.put('*/api/v4/flow_execute', () => Response.json(state)));
    await mount(<PipelineDynamicSpecStories.Overrides />);
    const value = page.getByRole('button', {
        name: 'Edit /throttlers/ui_demo/period',
        exact: true,
    });
    await expect(value).toHaveText('10000');
    await value.click();
    await expect.poll(() => editorJSON(page)).toBe(10000);
});

test('PipelineDynamicSpec: a map mask preserves a newer child in the replacement draft', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const state = snapshotWithDemo({limit: {operation: 'set', version: exactVersion, value: 2000}});
    state.override_spec = {
        operation: 'map',
        children: {
            throttlers: {
                operation: 'map',
                children: {
                    ui_demo: {
                        operation: 'map',
                        version: {$type: 'int64', $value: MAP_VERSION},
                        children: {limit: {operation: 'set', version: exactVersion, value: 2000}},
                    },
                },
            },
        },
    };
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(state);
            }
            mutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    const parent = page
        .locator('tbody tr')
        .filter({hasText: /^\/throttlers\/ui_demoDeletion mask/});
    await expect(
        parent.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}),
    ).toHaveText('—');
    await expect(
        page
            .locator('tbody tr')
            .filter({hasText: /^\/throttlers\/ui_demo\/limit/})
            .locator('[data-owner-version]'),
    ).toHaveAttribute('data-owner-version', NEWER_VERSION);
    await parent.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}).click();
    await expect.poll(() => editorJSON(page)).toEqual({limit: 2000});
    await replaceEditorContent(page, JSON.stringify({limit: 2000, period: 1500}));
    await applyEditor(page);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                path: '/throttlers/ui_demo',
                spec: {limit: 2000, period: 1500},
                expected_version: exactVersion,
                comment: 'Update value',
            },
        ]);
});

test('PipelineDynamicSpec: clicking an effective value edits one backoff and supports keyboard folding and selection', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const mutations: unknown[] = [];
    const legacyMutations: unknown[] = [];
    await router.use(
        http.all('*/api/v4/set_pipeline_dynamic_spec', async ({request}) => {
            legacyMutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const parameters = requestParameters(request);
            if (parameters.flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(dynamicSpecSnapshot);
            }
            mutations.push({parameters, body: await request.json()});
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    const path = '/computations/noop/empty_batch_backoff';
    const value = page.getByRole('button', {name: `Edit ${path}`, exact: true});
    await expect(value).toHaveText('250');
    await value.click();
    let dialog = page.getByRole('dialog');
    await expect(dialog.getByText(path, {exact: true})).toBeVisible();
    await replaceEditorContent(page, '280');
    await dialog.getByRole('textbox', {name: 'Comment', exact: true}).fill('Проверка патча 😊');
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    expect(legacyMutations).toEqual([]);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                parameters: expect.objectContaining({flow_command: 'set-pipeline-dynamic-spec'}),
                body: {
                    path,
                    spec: 280,
                    expected_version: exactVersion,
                    comment: Buffer.from('Проверка патча 😊', 'utf8').toString('latin1'),
                },
            },
        ]);
    for (const key of ['Enter', 'Space']) {
        await value.focus();
        await value.press(key);
        dialog = page.getByRole('dialog');
        await expect(dialog.getByText(path, {exact: true})).toBeVisible();
        await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    }
    const computation = page.locator('.g-ru-cell').filter({
        has: page.getByRole('button', {name: 'Edit /computations', exact: true}),
    });
    await computation.locator('.g-ru-cell__collapse button').click();
    await expect(value).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const collapsed = page.getByRole('button', {name: 'Edit /computations', exact: true});
    await expect(collapsed).toHaveText('{');
    await collapsed.click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByText('/computations', {exact: true})).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(value).toHaveCount(0);
    await computation.locator('.g-ru-cell__collapse button').click();
    await expect(value).toHaveText('250');
    const search = page.locator('[data-qa="qa:structuredyson:search"] input');
    await search.fill('250');
    await expect(value).toHaveClass(/g-ru-filtered-text_highlighted/);
    await value.click();
    dialog = page.getByRole('dialog');
    await expect(dialog.getByText(path, {exact: true})).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await search.fill('');
    const bounds = await value.boundingBox();
    if (!bounds) {
        throw new Error('Editable backoff is not visible');
    }
    await page.mouse.move(bounds.x + 1, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width - 1, bounds.y + bounds.height / 2, {
        steps: 8,
    });
    await page.mouse.up();
    await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
        .not.toBe('');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.evaluate(() => window.getSelection()?.removeAllRanges());
    await value.focus();
    await value.press('Enter');
    await expect(page.getByRole('dialog').getByText(path, {exact: true})).toBeVisible();
    expect(mutations).toHaveLength(1);
    await page.getByRole('dialog').getByRole('button', {name: 'Cancel', exact: true}).click();
    const originalValue = await value.elementHandle();
    if (!originalValue) {
        throw new Error('Editable backoff is not rendered');
    }
    await page.getByRole('radio', {name: 'Base', exact: true}).check();
    await originalValue.evaluate((element) => element.appendChild(document.createTextNode(' ')));
    await expect
        .poll(() =>
            originalValue.evaluate((element) => ({
                role: element.getAttribute('role'),
                tabindex: element.getAttribute('tabindex'),
                label: element.getAttribute('aria-label'),
            })),
        )
        .toEqual({role: null, tabindex: null, label: null});
});

test('PipelineDynamicSpec: clicking full-text controls preserves the original string viewer', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const text = 'Full string '.repeat(20);
    await router.use(
        http.put('*/api/v4/flow_execute', () =>
            Response.json({
                ...dynamicSpecSnapshot,
                effective_spec: {
                    ...(dynamicSpecSnapshot.effective_spec as Record<string, unknown>),
                    long_label: text,
                    empty_label: '',
                },
            }),
        ),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await expect(
        page.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}).first(),
    ).toBeVisible();
    await page.mouse.wheel(0, 1000);
    await expect(page.getByRole('button', {name: 'Edit /long_label', exact: true})).toBeVisible();
    const row = page.locator('.g-ru-cell').filter({
        has: page.getByRole('button', {name: 'Edit /long_label', exact: true}),
    });
    await row.locator('.g-ru-clickable-text').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
        page.getByRole('dialog').getByText('Edit dynamic specification', {exact: true}),
    ).toHaveCount(0);
    await expect(page.getByRole('dialog')).toContainText(text);
    await page.getByRole('dialog').getByRole('button', {name: 'Close dialog', exact: true}).click();
    const empty = page.getByRole('button', {name: 'Edit /empty_label', exact: true});
    await expect(empty).toHaveText('""');
    await empty.click();
    await expect(page.getByRole('dialog').getByText('/empty_label', {exact: true})).toBeVisible();
});

test('PipelineDynamicSpec: clicking empty maps masks and removed values opens the matching path', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    await router.use(dynamicSpecHandler);
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await expect(
        page.getByRole('button', {name: 'Edit /throttlers/ui_demo', exact: true}).first(),
    ).toBeVisible();
    await page.mouse.wheel(0, 1000);
    await expect(page.getByText('Runtime', {exact: true})).toBeVisible();
    await page.getByRole('button', {name: 'Edit /empty', exact: true}).click();
    let dialog = page.getByRole('dialog');
    await expect(dialog.getByText('/empty', {exact: true})).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    await expect(page.getByText('Edit', {exact: true})).toHaveCount(0);
    await expect(
        page.locator(
            '.yt-flow-dynamic-spec__value-button button, .yt-flow-dynamic-spec__value-button a, .yt-flow-dynamic-spec__value-button [role="button"]',
        ),
    ).toHaveCount(0);
    const label = page.getByRole('button', {name: 'Edit /unicode_group', exact: true});
    await label.scrollIntoViewIfNeeded();
    const text = label.locator('.string').filter({hasText: 'Квота 😊'});
    await text.scrollIntoViewIfNeeded();
    const bounds = await text.boundingBox();
    if (!bounds) {
        throw new Error('Override string is not visible');
    }
    await page.mouse.move(bounds.x + 1, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width - 1, bounds.y + bounds.height / 2, {steps: 8});
    await page.mouse.up();
    await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
        .not.toBe('');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await label.focus();
    await label.press('Enter');
    dialog = page.getByRole('dialog');
    await expect(dialog.getByText('/unicode_group', {exact: true})).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await page.evaluate(() => window.getSelection()?.removeAllRanges());
    for (const path of ['/empty', '/mask', '/missing']) {
        const value = page.getByRole('button', {name: `Edit ${path}`, exact: true});
        await expect(
            page
                .getByRole('row')
                .filter({has: value})
                .getByRole('button', {name: 'Update map', exact: true}),
        ).toHaveCount(0);
        await expect(value).toHaveText(path === '/empty' ? /\{\s*\}/ : '—');
        await value.click();
        dialog = page.getByRole('dialog');
        await expect(dialog.getByText(path, {exact: true})).toBeVisible();
        await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    }
    const cpu = page.getByRole('button', {
        name: 'Edit /job_manager/resource_limits/cpu',
        exact: true,
    });
    await cpu.focus();
    await cpu.press('Enter');
    await expect(
        page.getByRole('dialog').getByText('/job_manager/resource_limits/cpu', {exact: true}),
    ).toBeVisible();
});

test('PipelineDynamicSpec: editing one backoff sends one leaf with original CAS and Unicode comment', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const mutations: unknown[] = [];
    const legacyMutations: unknown[] = [];
    await router.use(
        http.all('*/api/v4/set_pipeline_dynamic_spec', async ({request}) => {
            legacyMutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const parameters = requestParameters(request);
            if (parameters.flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(dynamicSpecSnapshot);
            }
            mutations.push({parameters, body: await request.json()});
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('textbox', {name: 'Editor content'}).focus();
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    await page.keyboard.press(`${modifier}+f`);
    await dialog.getByRole('textbox', {name: 'Find', exact: true}).fill('250');
    await page.keyboard.press('Escape');
    await page.keyboard.insertText('280');

    await dialog.getByRole('textbox', {name: 'Comment', exact: true}).fill('Проверка патча 😊');
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    expect(legacyMutations).toEqual([]);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                parameters: expect.objectContaining({
                    flow_command: 'set-pipeline-dynamic-spec',
                    input_format: {$value: 'json', $attributes: {encode_utf8: true}},
                }),
                body: {
                    path: '/computations/noop/empty_batch_backoff',
                    spec: 280,
                    expected_version: exactVersion,
                    comment: Buffer.from('Проверка патча 😊', 'utf8').toString('latin1'),
                },
            },
        ]);
});

test('PipelineDynamicSpec: unchanged draft sends no mutation and multiple edits fail before writing', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command !== 'get-pipeline-dynamic-spec-state') {
                mutations.push(await request.json());
            }
            return Response.json(dynamicSpecSnapshot);
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await page
        .getByRole('dialog')
        .getByRole('textbox', {name: 'Comment', exact: true})
        .fill('Unchanged specification');
    await expect(
        page.getByRole('dialog').getByRole('button', {name: 'Confirm', exact: true}),
    ).toBeDisabled();
    await page.getByRole('dialog').getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(mutations).toEqual([]);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    const dialog = page.getByRole('dialog');
    await replaceEditorContent(page, '{"a": 1, "b": 2}');
    await applyEditor(page);
    await expect(dialog.getByText('No changes were saved.', {exact: false})).toBeVisible();
    expect(mutations).toEqual([]);
});

test('PipelineDynamicSpec: open editor keeps its original snapshot during background refresh', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    let loads = 0;
    const mutations: unknown[] = [];
    const later = {
        ...dynamicSpecSnapshot,
        version: {$type: 'int64', $value: '1923307469208162015'},
    };
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(++loads === 1 ? dynamicSpecSnapshot : later);
            }
            mutations.push(await request.json());
            return Response.json(
                {code: 1, message: 'Dynamic spec version mismatch'},
                {status: 500},
            );
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('button', {name: 'Edit dynamic specification'}).click();
    await replaceEditorContent(page, JSON.stringify({...humanEffectiveSpec, fresh: true}));
    await page.evaluate((snapshot) => {
        (
            window as typeof window & {store: {dispatch: (action: unknown) => unknown}}
        ).store.dispatch({
            type: 'flow.dynamicSpec/onSuccess',
            payload: {
                data: {
                    spec: snapshot.effective_spec,
                    version: snapshot.version,
                    dynamic_spec_state: snapshot,
                },
            },
        });
    }, later);
    await expect(page.getByText('Version: 1923307469208162015', {exact: true})).toBeVisible();
    const dialog = page.getByRole('dialog');
    await applyEditor(page);
    await expect(
        dialog.getByText('Dynamic spec version mismatch', {exact: false}).first(),
    ).toBeVisible();
    expect(mutations).toEqual([
        {path: '/fresh', spec: true, expected_version: exactVersion, comment: 'Update value'},
    ]);
});

test('PipelineDynamicSpec: override actions use displayed owner and model CAS', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const command = requestParameters(request).flow_command;
            if (command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(dynamicSpecSnapshot);
            }
            mutations.push({command, body: await request.json()});
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    await expect(page.locator('thead th').filter({hasText: /^Patch$/})).toBeVisible();
    await expect(page.locator('thead th').filter({hasText: /^Actions$/})).toHaveCount(0);
    const cpu = page.getByRole('row').filter({hasText: '/job_manager/resource_limits/cpu'});
    await expect(page.getByRole('button', {name: 'Cancel change', exact: true})).toHaveCount(0);
    await cpu.getByRole('button', {name: 'Cancel patch', exact: true}).click();
    await expect.poll(() => mutations.length).toBe(1);
    const labels = page.getByRole('row').filter({hasText: /^\/labels/});
    await labels.getByRole('button', {name: 'Cancel patch', exact: true}).click();
    await expect.poll(() => mutations.length).toBe(2);
    await page
        .getByRole('row')
        .filter({hasText: /^\/throttlers\/ui_demoReplace map/})
        .getByRole('button', {name: 'Cancel patch', exact: true})
        .click();
    await expect.poll(() => mutations.length).toBe(3);
    await page.getByRole('button', {name: 'Reset all overrides', exact: true}).click();
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                command: 'cancel-pipeline-dynamic-spec-patch',
                body: {version: exactVersion, expected_version: exactVersion},
            },
            {
                command: 'cancel-pipeline-dynamic-spec-patch',
                body: {
                    version: {$type: 'int64', $value: OWNER_VERSION},
                    expected_version: exactVersion,
                },
            },
            {
                command: 'cancel-pipeline-dynamic-spec-patch',
                body: {
                    version: {$type: 'int64', $value: MAP_VERSION},
                    expected_version: exactVersion,
                },
            },
            {
                command: 'reset-pipeline-dynamic-spec-override',
                body: {expected_version: exactVersion},
            },
        ]);
});

test('PipelineDynamicSpec: row patch actions preserve no-audit owners pending state and CAS errors', async ({
    mount,
    page,
    router,
}) => {
    const mutations: unknown[] = [];
    let reads = 0;
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            const command = requestParameters(request).flow_command;
            if (command === 'get-pipeline-dynamic-spec-state') {
                ++reads;
                return Response.json({...dynamicSpecSnapshot, audit: []});
            }
            mutations.push({command, body: await request.json()});
            await gate;
            return Response.json(
                {code: 1, message: 'Dynamic spec version mismatch'},
                {status: 500},
            );
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    const labels = page.getByRole('row').filter({hasText: /^\/labels/});
    const cancel = labels.getByRole('button', {name: 'Cancel patch', exact: true});
    try {
        await cancel.click();
        await expect.poll(() => mutations.length).toBe(1);
        for (const button of await page
            .getByRole('button', {name: /^Cancel (change|patch)$/})
            .all()) {
            await expect(button).toBeDisabled();
        }
        await expect(page.getByRole('button', {name: 'Update map', exact: true})).toHaveCount(0);
        await expect(
            page.getByRole('button', {name: 'Reset all overrides', exact: true}),
        ).toBeDisabled();
        await expect(
            labels.getByRole('button', {name: 'Edit /labels', exact: true}),
        ).toHaveAttribute('aria-disabled', 'true');
    } finally {
        release();
    }
    await expect(
        page.getByText('Dynamic spec version mismatch', {exact: false}).first(),
    ).toBeVisible();
    await expect(cancel).toBeEnabled();
    await expect.poll(() => reads).toBeGreaterThanOrEqual(2);
    expect(mutations).toEqual([
        {
            command: 'cancel-pipeline-dynamic-spec-patch',
            body: {
                version: {$type: 'int64', $value: OWNER_VERSION},
                expected_version: exactVersion,
            },
        },
    ]);
});

test('PipelineDynamicSpec: subtree editing preserves raw Unicode and binary siblings and exact non-ASCII paths', async ({
    mount,
    page,
    router,
}) => {
    test.slow();
    const mutations: unknown[] = [];
    await router.use(
        http.put('*/api/v4/flow_execute', async ({request}) => {
            if (requestParameters(request).flow_command === 'get-pipeline-dynamic-spec-state') {
                return Response.json(dynamicSpecSnapshot);
            }
            mutations.push(await request.json());
            return Response.json({version: exactVersion});
        }),
    );
    await mount(<PipelineDynamicSpecStories.Overrides />);
    await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
    await page
        .getByRole('row')
        .filter({hasText: /^\/unicode_groupReplace map/})
        .getByRole('button', {name: 'Edit /unicode_group', exact: true})
        .click();
    let dialog = page.getByRole('dialog');
    await expect(
        dialog.getByText('This action replaces the selected map and its nested overrides.', {
            exact: false,
        }),
    ).toBeVisible();
    await replaceEditorContent(
        page,
        JSON.stringify({changed: 2, label: 'Квота 😊', binary: '\xff', Квота: 3}),
    );
    await applyEditor(page);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                path: '/unicode_group',
                spec: {...unicodeGroup, changed: 2},
                expected_version: exactVersion,
                comment: 'Update value',
            },
        ]);
    await page.getByRole('radio', {name: 'Effective', exact: true}).check();
    await page.getByRole('button', {name: 'Edit /unicode_group/Квота', exact: true}).click();
    dialog = page.getByRole('dialog');
    await replaceEditorContent(page, '4');
    await applyEditor(page);
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                path: '/unicode_group',
                spec: {...unicodeGroup, changed: 2},
                expected_version: exactVersion,
                comment: 'Update value',
            },
            {
                path: '/unicode_group/' + RAW_UNICODE_KEY,
                spec: 4,
                expected_version: exactVersion,
                comment: 'Update value',
            },
        ]);
});

for (const kind of ['scalar', 'map'] as const) {
    test(`PipelineDynamicSpec: ${kind} updates require a new reason and a changed value`, async ({
        mount,
        page,
        router,
        expectScreenshot,
    }) => {
        test.slow();
        const initial = kind === 'scalar' ? 250 : {limit: 2000, period: 1000};
        const changed = kind === 'scalar' ? 280 : {limit: 2000, period: 1500};
        const state =
            kind === 'scalar'
                ? dynamicSpecSnapshot
                : snapshotWithDemo({
                      limit: {
                          operation: 'set',
                          version: {$type: 'int64', $value: NEWER_VERSION},
                          value: 2000,
                      },
                  });
        const mutations: unknown[] = [];
        await router.use(
            http.put('*/api/v4/flow_execute', async ({request}) => {
                const command = requestParameters(request).flow_command;
                if (command === 'get-pipeline-dynamic-spec-state') return Response.json(state);
                mutations.push({command, body: await request.json()});
                return Response.json({version: exactVersion});
            }),
        );
        await mount(<PipelineDynamicSpecStories.Overrides />);
        const path =
            kind === 'scalar' ? '/computations/noop/empty_batch_backoff' : '/throttlers/ui_demo';
        if (kind === 'map') await page.getByRole('radio', {name: 'Overrides', exact: true}).check();
        await page.getByRole('button', {name: `Edit ${path}`, exact: true}).click();
        const dialog = page.getByRole('dialog');
        const comment = dialog.getByRole('textbox', {name: 'Comment', exact: true});
        const confirm = dialog.getByRole('button', {name: 'Confirm', exact: true});
        await expect.poll(() => editorJSON(page)).toEqual(initial);
        await expect(comment).toHaveValue('');
        await replaceEditorContent(page, JSON.stringify(changed), true);
        await expect(confirm).toBeDisabled();
        expect(mutations).toEqual([]);
        for (const blank of ['   ', '\u0085', '\ufeff']) {
            await comment.fill(blank);
            await expect(confirm).toBeDisabled();
        }
        await expect(dialog).toContainText('Add a comment explaining the change.');
        expect(mutations).toEqual([]);
        for (const nonblank of ['\u200b', '\u001c']) {
            await comment.fill(nonblank);
            await expect(confirm).toBeEnabled();
        }
        expect(mutations).toEqual([]);
        await comment.fill('Причина изменения 😊');
        await replaceEditorContent(page, JSON.stringify(initial), true);
        await expect(confirm).toBeDisabled();
        expect(mutations).toEqual([]);
        // Different JSON text must still count as the unchanged original value.
        await replaceEditorContent(page, JSON.stringify(initial) + ' ', true);
        await expect(confirm).toBeDisabled();
        expect(mutations).toEqual([]);
        await replaceEditorContent(page, JSON.stringify(changed), true);
        await comment.fill('');
        await expect(confirm).toBeDisabled();
        if (kind === 'map') {
            await comment.focus();
            await expectScreenshot();
        }
        await comment.fill('Причина изменения 😊');
        await expect(confirm).toBeEnabled();
        await confirm.click();
        await expect
            .poll(() => mutations)
            .toEqual([
                {
                    command: 'set-pipeline-dynamic-spec',
                    body: {
                        path,
                        spec: changed,
                        expected_version: exactVersion,
                        comment:
                            '\u00d0\u009f\u00d1\u0080\u00d0\u00b8\u00d1\u0087\u00d0\u00b8\u00d0\u00bd\u00d0\u00b0 \u00d0\u00b8\u00d0\u00b7\u00d0\u00bc\u00d0\u00b5\u00d0\u00bd\u00d0\u00b5\u00d0\u00bd\u00d0\u00b8\u00d1\u008f \u00f0\u009f\u0098\u008a',
                    },
                },
            ]);
    });
}

for (const reject of [false, true]) {
    test(`PipelineDynamicSpec: legacy root preserves its Unicode reason and CAS (reject=${reject})`, async ({
        mount,
        page,
        router,
    }) => {
        const mutations: unknown[] = [];
        const nativeMutations: unknown[] = [];
        await router.use(
            http.get('*/api/v4/get_pipeline_dynamic_spec', () =>
                Response.json({spec: {a: 1}, version: exactVersion}),
            ),
            http.all('*/api/v4/set_pipeline_dynamic_spec', async ({request}) => {
                nativeMutations.push(await request.text());
                return Response.json({});
            }),
            http.put('*/api/v4/flow_execute', async ({request}) => {
                const command = requestParameters(request).flow_command;
                if (command === 'get-pipeline-dynamic-spec-state')
                    return Response.json(
                        {
                            code: 1,
                            message:
                                'No such command: get-pipeline-dynamic-spec-state. Possible commands: []',
                        },
                        {status: 500},
                    );
                mutations.push({
                    parameters: requestParameters(request),
                    body: await request.json(),
                });
                return reject
                    ? Response.json(
                          {code: 1, message: 'Comment argument is not supported'},
                          {status: 500},
                      )
                    : Response.json({version: exactVersion});
            }),
        );
        await mount(<PipelineDynamicSpecStories.UnsupportedController />);
        await page.getByRole('button', {name: 'Edit dynamic specification', exact: true}).click();
        const dialog = page.getByRole('dialog');
        const comment = dialog.getByRole('textbox', {name: 'Comment', exact: true});
        await expect(comment).toHaveValue('');
        await comment.fill('Причина изменения 😊');
        await expect(dialog.getByRole('button', {name: 'Confirm', exact: true})).toBeDisabled();
        await replaceEditorContent(page, JSON.stringify({a: 2}), true);
        await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
        await expect
            .poll(() => mutations)
            .toEqual([
                {
                    parameters: expect.objectContaining({
                        flow_command: 'set-pipeline-dynamic-spec',
                    }),
                    body: {
                        path: '',
                        spec: {a: 2},
                        expected_version: exactVersion,
                        comment:
                            '\u00d0\u009f\u00d1\u0080\u00d0\u00b8\u00d1\u0087\u00d0\u00b8\u00d0\u00bd\u00d0\u00b0 \u00d0\u00b8\u00d0\u00b7\u00d0\u00bc\u00d0\u00b5\u00d0\u00bd\u00d0\u00b5\u00d0\u00bd\u00d0\u00b8\u00d1\u008f \u00f0\u009f\u0098\u008a',
                    },
                },
            ]);
        if (reject)
            await expect(
                dialog.getByText('Comment argument is not supported', {exact: false}).first(),
            ).toBeVisible();
        else await expect(dialog).toHaveCount(0);
        expect(nativeMutations).toEqual([]);
    });
}

test('PipelineDynamicSpec: static specification keeps comment-free editing', async ({
    mount,
    page,
    router,
}) => {
    const mutations: unknown[] = [];
    await router.use(
        http.get('*/api/v4/get_pipeline_spec', () =>
            Response.json({spec: {a: 1}, version: exactVersion}),
        ),
        http.all('*/api/v4/set_pipeline_spec', async ({request}) => {
            mutations.push({parameters: requestParameters(request), body: await request.json()});
            return Response.json({});
        }),
    );
    await mount(<PipelineDynamicSpecStories.StaticSpecification />);
    await page.getByRole('button', {name: 'Edit static specification', exact: true}).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', {name: 'Comment', exact: true})).toHaveCount(0);
    const initialText = await editorText(page);
    expect(JSON.parse(initialText)).toEqual({a: 1});
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    const changeNumber = async (value: string) => {
        await dialog
            .locator('.monaco-editor .monaco-scrollable-element.editor-scrollable')
            .click({position: {x: 20, y: 20}});
        await page.keyboard.press(`${modifier}+A`);
        await page.keyboard.press('ArrowLeft');
        const digitOffset = initialText.replace(/\r\n?/g, '\n').indexOf('1');
        for (let offset = 0; offset < digitOffset; offset++) {
            await page.keyboard.press('ArrowRight');
        }
        await page.keyboard.press('Delete');
        await page.keyboard.insertText(value);
    };
    await changeNumber('2');
    await expect.poll(() => editorJSON(page)).toEqual({a: 2});
    await changeNumber('1');
    await expect.poll(() => editorText(page)).toBe(initialText);
    await expect.poll(() => editorJSON(page)).toEqual({a: 1});
    expect(mutations).toEqual([]);
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                parameters: {
                    pipeline_path: PIPELINE_PATH,
                    expected_version: exactVersion,
                    force: false,
                },
                body: {a: 1},
            },
        ]);
    await page.getByRole('button', {name: 'Edit static specification', exact: true}).click();
    await expect(dialog.getByRole('textbox', {name: 'Comment', exact: true})).toHaveCount(0);
    await changeNumber('2');
    await expect.poll(() => editorJSON(page)).toEqual({a: 2});
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect
        .poll(() => mutations)
        .toEqual([
            {
                parameters: {
                    pipeline_path: PIPELINE_PATH,
                    expected_version: exactVersion,
                    force: false,
                },
                body: {a: 1},
            },
            {
                parameters: {
                    pipeline_path: PIPELINE_PATH,
                    expected_version: exactVersion,
                    force: false,
                },
                body: {a: 2},
            },
        ]);
});
