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
        ...pageScreenshotOptions
    } = defaultParams) => {
        await page.clock.setFixedTime('2025-07-20T10:00:00');
        const captureScreenshot = async () => {
            return (component || page.locator('.playwright-wrapper-test')).screenshot({
                animations: 'disabled',
                ...pageScreenshotOptions,
            });
        };

        const nameScreenshot =
            testInfo.titlePath.slice(1).join(' ') + (nameSuffix ? ` ${nameSuffix}` : '');

        const themes = paramsThemes || defaultParams.themes;

        // Wait for loading of all the images
        const locators = await page.locator('//img').all();
        await Promise.all(
            locators.map((locator) =>
                locator.evaluate(
                    (image: HTMLImageElement) =>
                        image.complete ||
                        new Promise<unknown>((resolve) => image.addEventListener('load', resolve)),
                ),
            ),
        );

        // Wait for loading fonts
        await page.evaluate(() => document.fonts.ready);

        if (themes?.includes('light')) {
            await page.evaluate(() => document.body.classList.add('theme-light'));
            await page.emulateMedia({colorScheme: 'light'});

            expect(await captureScreenshot()).toMatchSnapshot({
                name: `${nameScreenshot} light.png`,
            });
        }

        if (themes?.includes('dark')) {
            await page.evaluate(() => document.body.classList.add('theme-dark'));
            await page.emulateMedia({colorScheme: 'dark'});

            expect(await captureScreenshot()).toMatchSnapshot({
                name: `${nameScreenshot} dark.png`,
            });
        }
    };

    await use(expectScreenshot);
};
