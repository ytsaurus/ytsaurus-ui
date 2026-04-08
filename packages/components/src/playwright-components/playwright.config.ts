import {createRequire} from 'node:module';
import {resolve} from 'node:path';

import type {PlaywrightTestConfig} from '@playwright/experimental-ct-react';
import {defineConfig, devices} from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import svgr from 'vite-plugin-svgr';

import {sassTildeImporter} from '../../.storybook/sass-tilde-importer';

const configDir = __dirname;

/** Same resolution as `.storybook/main.ts`: CJS `bignumber.js`, not `.mjs` (avoids `BigNumber.config is not a function` in CT). */
const require = createRequire(resolve(configDir, '../../package.json'));
let bignumberBundleEntry: string;
try {
    bignumberBundleEntry = require.resolve('bignumber.js');
} catch {
    bignumberBundleEntry = resolve(configDir, '../../node_modules/bignumber.js/bignumber.js');
}

const pathFromSrc = (p: string) => resolve(configDir, '..', p);

const reporter: PlaywrightTestConfig['reporter'] = [];

reporter.push(
    ['list'],
    [
        'html',
        {
            open: 'never',
            outputFolder: resolve(configDir, process.env.IS_DOCKER ? 'report-docker' : 'report'),
        },
    ],
);

const config: PlaywrightTestConfig = {
    outputDir: resolve(configDir, 'test-results'),
    testDir: pathFromSrc('.'),
    testMatch: '*/**/__tests__/*.visual.test.tsx',
    updateSnapshots: process.env.UPDATE_REQUEST ? 'all' : 'missing',
    snapshotPathTemplate:
        '{testDir}/{testFileDir}/../__snapshots__/{testFileName}-snapshots/{arg}{-projectName}-linux{ext}',
    timeout: 10 * 1000,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: 3,
    workers: process.env.CI ? 8 : undefined,
    reporter,
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
                    include: /@gravity-ui\/icons\/.*\.svg(?:\?.*)?$/,
                }),
                commonjs(),
                react({
                    babel: {
                        presets: ['@babel/preset-typescript', '@babel/preset-react'],
                    },
                }),
            ],
            resolve: {
                alias: {
                    'bignumber.js': bignumberBundleEntry,
                },
            },
            optimizeDeps: {
                include: ['bignumber.js'],
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        api: 'modern-compiler',
                        importers: [sassTildeImporter],
                    },
                },
            },
        },
    },
    // WebKit is omitted: unstable on many Linux setups (browser/context closes during CT).
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                deviceScaleFactor: 2,
            },
        },
    ],
};

export default defineConfig(config);
