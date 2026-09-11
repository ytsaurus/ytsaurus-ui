import React from 'react';
import {type Page, type Request} from '@playwright/test';

import {expect, test} from '../../../../playwright-components/core';

import {EditOperationDialogStories} from '../__stories__';
import {
    TEST_OPERATION_ID,
    getLongPoolTreeOperationHandler,
    getOperationHandler,
    getTerminalOperationHandler,
    patchOperationSpecErrorHandler,
    patchOperationSpecHandler,
    updateOperationParametersHandler,
} from '../__stories__/mocks';

const LONG_POOL_TREE_NAME = 'physical_aarch64_with_a_very_long_pool_tree_name';

test.use({viewport: {width: 1280, height: 900}});

async function waitForSpecification(page: Page) {
    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Maximum failed job count', {exact: true})).toBeVisible();

    return dialog;
}

function getMaximumFailedJobCount(page: Page) {
    return page
        .getByRole('dialog')
        .getByRole('textbox', {name: 'Maximum failed job count', exact: true});
}

async function selectEditorMode(page: Page, mode: 'Form' | 'JSON') {
    await page.getByRole('dialog').getByRole('radio', {name: mode, exact: true}).check();
}

async function selectPoolTree(page: Page, tree: string) {
    await page
        .getByRole('dialog')
        .getByRole('listitem')
        .filter({hasText: new RegExp(`^${tree}$`)})
        .click();
}

async function setJsonEditorValue(page: Page, value: object) {
    const editor = page.locator('.monaco-editor').first();
    const properties = JSON.stringify(value, null, 2).split('\n').slice(1, -1).join('\n');

    await expect(editor).toBeVisible();
    await editor.click();
    await page.keyboard.press('ControlOrMeta+KeyA');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.type(`\n${properties}\n`);
}

async function getEncodedParameters(request: Request) {
    const headers = await request.allHeaders();
    const value = Object.entries(headers)
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, chunk]) => chunk)
        .join('');

    return JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as unknown;
}

test('EditOperationDialog: Specification form', async ({mount, expectScreenshot, page, router}) => {
    await router.use(getOperationHandler);
    await mount(<EditOperationDialogStories.Default />);

    const dialog = await waitForSpecification(page);
    await expect(dialog.getByRole('button', {name: 'Save'})).toBeDisabled();
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: Specification JSON', async ({mount, expectScreenshot, page, router}) => {
    await router.use(getOperationHandler);
    await mount(<EditOperationDialogStories.Default />);

    const dialog = await waitForSpecification(page);
    await selectEditorMode(page, 'JSON');
    await setJsonEditorValue(page, {
        '/max_failed_job_count': 12,
        '/some/future/path': true,
    });

    await expect(dialog.getByRole('button', {name: 'Save'})).toBeEnabled();
    await dialog.getByText('Specification patch', {exact: true}).click();
    await page.mouse.move(0, 0);
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: Pool tree', async ({mount, expectScreenshot, page, router}) => {
    await router.use(getOperationHandler);
    await mount(<EditOperationDialogStories.Default />);

    const dialog = await waitForSpecification(page);
    await selectPoolTree(page, 'cloud');
    await expect(dialog.getByRole('heading', {name: 'Resource Limits'}).first()).toBeVisible();
    await page.mouse.move(0, 0);
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: Long pool tree names', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(getLongPoolTreeOperationHandler);
    await mount(<EditOperationDialogStories.LongPoolTreeNames />);

    const dialog = await waitForSpecification(page);
    await selectPoolTree(page, LONG_POOL_TREE_NAME);
    await expect(dialog.getByRole('heading', {name: 'Resource Limits'}).first()).toBeVisible();
    await page.mouse.move(0, 0);
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: Unsupported specification patch', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(getOperationHandler);
    await mount(<EditOperationDialogStories.UnsupportedSpecificationPatch />);

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', {name: 'Resource Limits'}).first()).toBeVisible();
    await expect(dialog.getByText('Specification', {exact: true})).toHaveCount(0);
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: Terminal operation', async ({mount, expectScreenshot, page, router}) => {
    await router.use(getTerminalOperationHandler);
    await mount(<EditOperationDialogStories.TerminalOperation />);

    const dialog = await waitForSpecification(page);
    await expect(dialog.getByRole('button', {name: 'Save'})).toBeDisabled();
    await expect(getMaximumFailedJobCount(page)).toBeDisabled();
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: Maximum failed jobs enables Save', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(getOperationHandler);
    await mount(<EditOperationDialogStories.Default />);

    const dialog = await waitForSpecification(page);
    const save = dialog.getByRole('button', {name: 'Save'});

    await expect(save).toBeDisabled();
    await getMaximumFailedJobCount(page).fill('12');
    await expect(save).toBeEnabled();
    await expectScreenshot({component: dialog});
});

test('EditOperationDialog: preserves JSON fields when switching editor modes', async ({
    mount,
    page,
    router,
}) => {
    await router.use(getOperationHandler);
    await mount(<EditOperationDialogStories.Default />);

    await waitForSpecification(page);
    await selectEditorMode(page, 'JSON');
    await setJsonEditorValue(page, {
        '/max_failed_job_count': 12,
        '/some/future/path': true,
    });

    await selectEditorMode(page, 'Form');
    await expect(getMaximumFailedJobCount(page)).toHaveValue('12');
    await selectEditorMode(page, 'JSON');
    await expect(page.locator('.monaco-editor .view-lines')).toContainText('/some/future/path');
});

test('EditOperationDialog: submits specification and pool tree changes', async ({
    mount,
    page,
    router,
}) => {
    await router.use(
        getOperationHandler,
        patchOperationSpecHandler,
        updateOperationParametersHandler,
    );
    await mount(<EditOperationDialogStories.Default />);

    const dialog = await waitForSpecification(page);
    await getMaximumFailedJobCount(page).fill('12');
    await selectPoolTree(page, 'cloud');
    await dialog.getByRole('textbox', {name: 'Weight Weight', exact: true}).fill('7');

    const patchRequestPromise = page.waitForRequest((request) =>
        request.url().endsWith('/api/v3/patch_op_spec'),
    );
    const updateRequestPromise = page.waitForRequest((request) =>
        request.url().endsWith('/api/v3/update_op_parameters'),
    );

    await dialog.getByRole('button', {name: 'Save'}).click();

    const patchRequest = await patchRequestPromise;
    const updateRequest = await updateRequestPromise;

    expect(patchRequest.postDataJSON()).toEqual({
        operation_id: TEST_OPERATION_ID,
        patches: [{path: '/max_failed_job_count', value: 12}],
    });
    await expect(getEncodedParameters(updateRequest)).resolves.toEqual({
        operation_id: TEST_OPERATION_ID,
        parameters: {
            scheduling_options_per_pool_tree: {
                cloud: {weight: 7},
            },
        },
    });
});

test('EditOperationDialog: displays partial submit error', async ({
    mount,
    expectScreenshot,
    page,
    router,
}) => {
    await router.use(getOperationHandler, patchOperationSpecErrorHandler);
    await mount(<EditOperationDialogStories.Default />);

    const dialog = await waitForSpecification(page);
    await getMaximumFailedJobCount(page).fill('12');
    await dialog.getByRole('button', {name: 'Save'}).click();

    await expect(
        dialog.getByText('Failed to update the operation specification').first(),
    ).toBeVisible();
    await expect(dialog).toBeVisible();
    await expectScreenshot({component: dialog});
});
