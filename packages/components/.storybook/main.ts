import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import type {StorybookConfig} from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';

const require = createRequire(import.meta.url);
const storybookDir = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.join(storybookDir, '..');
const nodeModules = path.join(pkgRoot, 'node_modules');
/** `build:storybook` output; if it exists, Vite must not watch it or dev HMR races with optimizeDeps and chunk URLs 404. */
const storybookStaticDir = path.join(pkgRoot, 'storybook-static');

/** CJS hammer/format in @ytsaurus/interface-helpers uses require('bignumber.js'); Vite must resolve the bare id for the browser bundle. */
let bignumberBundleEntry: string;
try {
    bignumberBundleEntry = require.resolve('bignumber.js');
} catch {
    bignumberBundleEntry = path.join(nodeModules, 'bignumber.js/bignumber.mjs');
}

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-docs'],
    framework: {
        name: '@storybook/react-vite',
        options: {},
    },
    async viteFinal(viteConfig) {
        const {mergeConfig} = await import('vite');
        return mergeConfig(viteConfig, {
            server: {
                watch: {
                    ignored: [storybookStaticDir, `${storybookStaticDir}/**`],
                },
            },
            resolve: {
                alias: {
                    'bignumber.js': bignumberBundleEntry,
                },
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        api: 'modern-compiler',
                        loadPaths: [nodeModules],
                    },
                },
            },
            optimizeDeps: {
                include: [
                    'bignumber.js',
                    // Pre-bundle React entry used by the preview so optimizeDeps does not invalidate mid-session (fixes missing chunk-* under .cache/storybook).
                    'react/jsx-dev-runtime',
                ],
            },
            plugins: [
                // Only real .svg imports from @gravity-ui/icons (not uikit’s svg.js, etc.)
                svgr({
                    include: /@gravity-ui\/icons\/.*\.svg(?:\?.*)?$/,
                }),
            ],
        });
    },
};

export default config;
