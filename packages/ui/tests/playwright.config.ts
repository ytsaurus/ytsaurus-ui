import fs from 'fs';
import {defineConfig, devices} from '@playwright/test';

import {AUTH_FILE} from './contants';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const headless = process.env.HEADLESS !== 'false';

const {E2E_MATCH = '.spec.', E2E_TEST_DIR = './e2e'} = process.env;
const testMatch = new RegExp(E2E_MATCH.replace(/\./g, '\\.'));

function storageState() {
    return fs.existsSync(AUTH_FILE) ? AUTH_FILE : undefined;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    timeout: 10000,
    testDir: E2E_TEST_DIR,
    testMatch,
    /* Run tests in files in parallel */
    fullyParallel: headless,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: Boolean(process.env.CI),
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : 1,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [['html', {open: 'never'}]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        headless,

        /* Base URL to use in actions like `await page.goto('/')`. */
        // baseURL: 'http://127.0.0.1:3000',

        ignoreHTTPSErrors: true,
        testIdAttribute: 'data-qa',
        storageState: storageState(),

        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    expect: {
        toHaveScreenshot: {
            caret: 'hide',
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']},
        },
        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ..devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   url: 'http://127.0.0.1:3000',
    //   reuseExistingServer: !process.env.CI,
    // },
});
