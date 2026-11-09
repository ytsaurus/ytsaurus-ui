import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';
import {EditSpecDialogStories} from '../__stories__';

for (const theme of ['light', 'dark'] as const) {
    test(`EditSpecDialog: required comment and comment-only update ${theme}`, async ({
        mount,
        page,
        expectScreenshot,
    }) => {
        await mount(<EditSpecDialogStories.Comment />);
        const dialog = page.getByRole('dialog');
        const comment = dialog.getByRole('textbox', {name: 'Comment'});
        const confirm = dialog.getByRole('button', {name: 'Confirm', exact: true});
        await expect(comment).toHaveValue('Initial reason');
        await expect(confirm).toBeDisabled();
        await comment.fill('   ');
        await expect(confirm).toBeDisabled();
        await comment.fill('New reason');
        await expect(confirm).toBeEnabled();
        await expectScreenshot({themes: [theme], component: dialog});
        await confirm.click();
        await expect(dialog).toHaveCount(0);
        await expect(page.getByRole('status', {name: 'Applied specification'})).toHaveText(
            JSON.stringify({spec: {batch_duration: 1001}, options: {comment: 'New reason'}}),
        );
    });
}

test('EditSpecDialog: comment cannot replace a required value change', async ({mount, page}) => {
    await mount(<EditSpecDialogStories.ValueRequired />);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', {name: 'Comment'}).fill('New reason');
    const confirm = dialog.getByRole('button', {name: 'Confirm', exact: true});
    await expect(confirm).toBeDisabled();
    const editor = dialog.getByRole('textbox', {name: 'Editor content'});
    await editor.focus();
    await expect(editor).toBeFocused();
    const modifier = await page.evaluate(() =>
        navigator.userAgent.includes('Macintosh') ? 'Meta' : 'Control',
    );
    await page.keyboard.press(`${modifier}+A`);
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('{"batch_duration":1002}');
    await expect(confirm).toBeEnabled();
    await confirm.click();
    await expect(page.getByRole('status', {name: 'Applied specification'})).toHaveText(
        JSON.stringify({spec: {batch_duration: 1002}, options: {comment: 'New reason'}}),
    );
});

test('EditSpecDialog: save error stays in the open editor', async ({mount, page}) => {
    await mount(<EditSpecDialogStories.SaveError />);
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('textbox', {name: 'Comment'}).fill('New reason');
    await dialog.getByRole('button', {name: 'Confirm', exact: true}).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Cannot save specification').first()).toBeVisible();
    await dialog.getByRole('button', {name: 'Cancel', exact: true}).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('status', {name: 'Applied specification'})).toBeEmpty();
});
