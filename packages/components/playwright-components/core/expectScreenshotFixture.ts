import {expect} from '@playwright/experimental-ct-react';

import type {CaptureScreenshotParams, ExpectScreenshotFixture, PlaywrightFixture} from './types';

const defaultParams: CaptureScreenshotParams = {
    themes: ['light', 'dark'],
};

export const expectScreenshotFixture: PlaywrightFixture<ExpectScreenshotFixture> = async (
    {page},
    use,
    testInfo,
) => {
    const applyTheme = async (theme: 'light' | 'dark') => {
        await page.emulateMedia({colorScheme: theme});
        await page.evaluate((currentTheme) => {
            document.body.classList.toggle('theme-light', currentTheme === 'light');
            document.body.classList.toggle('theme-dark', currentTheme === 'dark');

            document.querySelectorAll('.yt-components-root').forEach((root) => {
                root.classList.toggle('yt-components-root_theme_dark', currentTheme === 'dark');
            });
        }, theme);
        await page.waitForFunction(
            (currentTheme) => document.body.classList.contains(`g-root_theme_${currentTheme}`),
            theme,
        );
    };

    const expectScreenshot: ExpectScreenshotFixture = async ({
        component,
        nameSuffix,
        themes: paramsThemes,
        beforeScreenshot,
        ...pageScreenshotOptions
    } = defaultParams) => {
        const captureScreenshot = async () => {
            const {style: injectStyle, ...screenshotRest} = pageScreenshotOptions;
            return (component || page.locator('.playwright-wrapper-test')).screenshot({
                animations: 'disabled',
                timeout: 30_000,
                // SegmentedRadioGroup / tables can keep layout “unstable” for Playwright’s RAF checks.
                style: [injectStyle, '*{animation:none!important;transition:none!important}']
                    .filter(Boolean)
                    .join(''),
                ...screenshotRest,
            });
        };

        const nameScreenshot =
            testInfo.titlePath.slice(1).join(' ') + (nameSuffix ? ` ${nameSuffix}` : '');

        const themes = paramsThemes || defaultParams.themes;

        const locators = await page.locator('//img').all();
        await Promise.all(
            locators.map((locator) =>
                locator.evaluate((image: HTMLImageElement) => {
                    if (image.complete) {
                        return Promise.resolve();
                    }
                    return new Promise<void>((resolve) => {
                        image.addEventListener('load', () => resolve(), {once: true});
                        image.addEventListener('error', () => resolve(), {once: true});
                    });
                }),
            ),
        );

        await page.waitForFunction(() => document.fonts.ready);

        if (themes?.includes('light')) {
            await applyTheme('light');

            await beforeScreenshot?.();
            expect(await captureScreenshot()).toMatchSnapshot({
                name: `${nameScreenshot} light.png`,
            });
        }

        if (themes?.includes('dark')) {
            await applyTheme('dark');

            await beforeScreenshot?.();
            expect(await captureScreenshot()).toMatchSnapshot({
                name: `${nameScreenshot} dark.png`,
            });
        }
    };

    await use(expectScreenshot);
};
