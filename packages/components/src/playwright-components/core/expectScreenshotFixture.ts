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
                        return;
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
            await page.evaluate(() => document.body.classList.add('theme-light'));
            await page.emulateMedia({colorScheme: 'light'});

            await beforeScreenshot?.();
            expect(await captureScreenshot()).toMatchSnapshot({
                name: `${nameScreenshot} light.png`,
            });
        }

        if (themes?.includes('dark')) {
            await page.evaluate(() => document.body.classList.add('theme-dark'));
            await page.emulateMedia({colorScheme: 'dark'});

            await beforeScreenshot?.();
            expect(await captureScreenshot()).toMatchSnapshot({
                name: `${nameScreenshot} dark.png`,
            });
        }
    };

    await use(expectScreenshot);
};
