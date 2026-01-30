import {resolve} from 'path';

import type {PlaywrightTestConfig} from '@playwright/experimental-ct-react';
import {defineConfig, devices} from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';

function pathFromRoot(p: string) {
    return resolve(__dirname, '../../../', p);
}

const reporter: PlaywrightTestConfig['reporter'] = [];

reporter.push(
    ['list'],
    [
        'html',
        {
            open: 'never',
            outputFolder: resolve(__dirname, process.env.IS_DOCKER ? 'report-docker' : 'report'),
        },
    ],
);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    outputDir: resolve(__dirname, 'test-results'),
    testDir: pathFromRoot('src'),
    testMatch: '*/**/__tests__/*.visual.test.tsx',
    updateSnapshots: process.env.UPDATE_REQUEST ? 'all' : 'missing',
    snapshotPathTemplate:
        '{testDir}/{testFileDir}/../__snapshots__/{testFileName}-snapshots/{arg}{-projectName}-linux{ext}',
    /* Maximum time one test can run for. */
    timeout: 10 * 1000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: Boolean(process.env.CI),
    /* 
        Retry everytime to avoid unccesary flaps
        TODO: try to fix flaps in CI
    */
    retries: 3,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 8 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter,
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        testIdAttribute: 'data-qa',
        video: 'retain-on-failure',
        headless: true,
        screenshot: 'only-on-failure',
        timezoneId: 'UTC',
        ctCacheDir: process.env.IS_DOCKER ? '.cache-docker' : '.cache',
        ctViteConfig: {
            plugins: [
                svgr({
                    include: '**/*.svg',
                }),
                commonjs(),
                react({
                    babel: {
                        presets: ['@babel/preset-typescript', '@babel/preset-react'],
                    },
                }),
            ],
            resolve: {
                alias: [{find: /^~(.*)$/, replacement: '$1'}],
            },
            //@ts-ignore
            css: {
                //@ts-ignore
                preprocessorOptions: {
                    //@ts-ignore
                    scss: {
                        //@ts-ignore
                        api: 'modern-compiler',
                    },
                },
            },
        },
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                deviceScaleFactor: 2,
            },
        },
        {
            name: 'webkit',
            use: {
                ...devices['Desktop Safari'],
                deviceScaleFactor: 2,
            },
        },
    ],
};

export default defineConfig(config);
