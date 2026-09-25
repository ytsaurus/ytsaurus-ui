import path from 'path';

import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
    testDir: './smoke',
    testMatch: '*.spec.ts',
    outputDir: path.resolve(__dirname, '../tmp/storybook-smoke'),
    timeout: 30_000,
    use: {
        baseURL: 'http://127.0.0.1:8008/storybook-static/',
        headless: true,
    },
    webServer: {
        command: 'python3 -m http.server 8008',
        cwd: path.resolve(__dirname, '..'),
        url: 'http://127.0.0.1:8008/storybook-static/iframe.html',
        reuseExistingServer: !process.env.CI,
    },
    projects: [
        {
            name: 'chromium',
            use: devices['Desktop Chrome'],
        },
    ],
});
