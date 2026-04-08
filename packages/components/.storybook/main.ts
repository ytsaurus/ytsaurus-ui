import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import type {StorybookConfig} from '@storybook/react-vite';
import svgr from 'vite-plugin-svgr';

import {sassTildeImporter} from './sass-tilde-importer';

const require = createRequire(import.meta.url);
const storybookDir = path.dirname(fileURLToPath(import.meta.url));

/** CJS hammer/format in @ytsaurus/interface-helpers uses require('bignumber.js'); Vite must resolve the bare id for the browser bundle. */
let bignumberBundleEntry: string;
try {
    bignumberBundleEntry = require.resolve('bignumber.js');
} catch {
    bignumberBundleEntry = path.join(storybookDir, '../node_modules/bignumber.js/bignumber.mjs');
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
            resolve: {
                alias: {
                    'bignumber.js': bignumberBundleEntry,
                },
            },
            css: {
                preprocessorOptions: {
                    scss: {
                        api: 'modern-compiler',
                        importers: [sassTildeImporter],
                    },
                },
            },
            optimizeDeps: {
                include: ['bignumber.js'],
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
