import React from 'react';

import {expect, test} from '../../../../../../playwright-components/core';

import {FlowStateKeyBuilder} from '../FlowStateKeyBuilder';
import {FlowStateKeyDialog} from '../FlowStateKeyDialog';

test('FlowStateKeyBuilder: narrow raw input and pencil launcher stay adjacent', async ({
    mount,
    page,
}, testInfo) => {
    await page.evaluate(() => document.body.classList.add('theme-light'));
    await page.emulateMedia({colorScheme: 'light'});
    await mount(
        <FlowStateKeyBuilder
            columns={[{name: 'account', type: 'string'}]}
            values={{account: 'alice'}}
            onChange={() => {}}
        />,
        {width: 480},
    );

    const rawInput = page.getByPlaceholder('[foo; bar; baz]');
    const launcher = page.getByRole('button', {name: 'Edit fields'});
    await expect(rawInput).toBeInViewport();
    await expect(launcher).toBeInViewport();
    expect(await launcher.locator('svg').count()).toBeGreaterThan(0);
    await expect(launcher).toHaveText('');
    const rawBox = await rawInput.boundingBox();
    const launcherBox = await launcher.boundingBox();
    expect(rawBox).not.toBeNull();
    expect(launcherBox).not.toBeNull();
    if (!rawBox || !launcherBox) {
        throw new Error('Expected the raw input and launcher to have browser geometry');
    }
    expect(launcherBox.x).toBeGreaterThanOrEqual(rawBox.x + rawBox.width);
    expect(Math.abs(launcherBox.y - rawBox.y)).toBeLessThanOrEqual(4);
    await launcher.focus();
    await expect(launcher).toBeFocused();
    await launcher.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Edit fields');
    await page.screenshot({path: testInfo.outputPath('narrow-light.png')});

    await page.evaluate(() => {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
    });
    await page.emulateMedia({colorScheme: 'dark'});
    await expect(rawInput).toBeInViewport();
    await expect(launcher).toBeInViewport();
    await page.screenshot({path: testInfo.outputPath('narrow-dark.png')});
});

test('FlowStateKeyDialog: visible title and vertical fields', async ({mount, page}, testInfo) => {
    await page.evaluate(() => document.body.classList.add('theme-light'));
    await page.emulateMedia({colorScheme: 'light'});
    await mount(
        <FlowStateKeyDialog
            visible
            columns={[
                {name: 'account', type: 'string'},
                {name: 'region', type: 'int64'},
            ]}
            values={{account: 'alice', region: 'ru-central1'}}
            onApply={() => {}}
            onClose={() => {}}
        />,
    );

    const dialog = page.getByRole('dialog');
    const title = await dialog.evaluate((element) => {
        const titleIds =
            element.getAttribute('aria-labelledby')?.split(/\s+/).filter(Boolean) ?? [];
        const titles = titleIds.flatMap((id) => {
            const candidate = document.getElementById(id);
            return candidate && element.contains(candidate) ? [candidate] : [];
        });
        return {
            titleIds,
            containedTitleCount: titles.length,
            globalTitleCount: titleIds.length
                ? document.querySelectorAll(`[id="${CSS.escape(titleIds[0])}"]`).length
                : 0,
            titleText: titles[0]?.textContent?.trim() ?? '',
            visible:
                titles[0] !== undefined &&
                getComputedStyle(titles[0]).display !== 'none' &&
                getComputedStyle(titles[0]).visibility !== 'hidden',
        };
    });
    expect(title.titleIds).toHaveLength(1);
    expect(title.containedTitleCount).toBe(1);
    expect(title.globalTitleCount).toBe(1);
    expect(title.titleText).not.toBe('');
    expect(title.visible).toBe(true);
    await expect(dialog).toHaveAccessibleName(title.titleText);

    const accountName = dialog.getByText('account', {exact: true});
    const stringType = dialog.getByText('string', {exact: true});
    const regionName = dialog.getByText('region', {exact: true});
    const integerType = dialog.getByText('int64', {exact: true});
    await expect(accountName).toHaveCount(1);
    await expect(stringType).toHaveCount(1);
    await expect(regionName).toHaveCount(1);
    await expect(integerType).toHaveCount(1);
    await expect(dialog.getByText('account (string)', {exact: true})).toHaveCount(0);
    await expect(dialog.getByText('region (int64)', {exact: true})).toHaveCount(0);
    const textStyles = await accountName.evaluate(
        (name, type) => {
            const nameStyle = getComputedStyle(name);
            const typeStyle = getComputedStyle(type as Element);
            return {
                nameColor: nameStyle.color,
                nameFontSize: Number.parseFloat(nameStyle.fontSize),
                typeColor: typeStyle.color,
                typeFontSize: Number.parseFloat(typeStyle.fontSize),
            };
        },
        await stringType.elementHandle(),
    );
    expect(textStyles.typeColor).not.toBe(textStyles.nameColor);
    expect(textStyles.typeFontSize).toBeLessThanOrEqual(textStyles.nameFontSize);

    const fields = dialog.getByRole('textbox');
    await expect(fields).toHaveCount(2);
    const first = await fields.nth(0).boundingBox();
    const second = await fields.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    if (!first || !second) {
        throw new Error('Expected both key fields to have browser geometry');
    }
    expect(first.height).toBeGreaterThan(0);
    expect(second.height).toBeGreaterThan(0);
    expect(second.y).toBeGreaterThan(first.y);
    expect(first.y + first.height).toBeLessThanOrEqual(second.y);

    const close = dialog.getByRole('button', {name: 'Close'});
    await expect(close).toBeVisible();
    await close.focus();
    await expect(close).toBeFocused();
    await close.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Close');
    await page.screenshot({path: testInfo.outputPath('dialog-light.png')});

    await page.evaluate(() => {
        document.body.classList.remove('theme-light');
        document.body.classList.add('theme-dark');
    });
    await page.emulateMedia({colorScheme: 'dark'});
    await expect(page.locator('body')).toHaveClass(/g-root_theme_dark/);
    await expect(close).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
    await expect(dialog.getByRole('button', {name: 'Cancel'})).toHaveCSS(
        'color',
        'rgba(255, 255, 255, 0.85)',
    );
    const darkTextStyles = await accountName.evaluate(
        (name, type) => {
            const nameStyle = getComputedStyle(name);
            const typeStyle = getComputedStyle(type as Element);
            return {
                nameColor: nameStyle.color,
                typeColor: typeStyle.color,
                nameFontSize: Number.parseFloat(nameStyle.fontSize),
                typeFontSize: Number.parseFloat(typeStyle.fontSize),
            };
        },
        await stringType.elementHandle(),
    );
    expect(darkTextStyles.typeColor).not.toBe(darkTextStyles.nameColor);
    expect(darkTextStyles.typeFontSize).toBeLessThanOrEqual(darkTextStyles.nameFontSize);
    await expect(close).toBeVisible();
    await page.screenshot({path: testInfo.outputPath('dialog-dark.png')});
});
