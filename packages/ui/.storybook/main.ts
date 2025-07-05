import type {StorybookConfig} from '@storybook/react-webpack5';
import {configureWebpackConfigForStorybook} from '@gravity-ui/app-builder';
import path from 'path';

const config: StorybookConfig = {
    framework: '@storybook/react-webpack5',
    stories: ['../src/**/*.stories.@(ts|tsx)'],
    staticDirs: ['../public'],
    addons: [
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.(css|scss)$/i,
                        use: [
                            'style-loader',
                            'css-loader',
                            'sass-loader',
                        ],
                    },
                ],
            },
        },
        './theme-addon/register.tsx',
        'msw-storybook-addon',
        '@storybook/addon-webpack5-compiler-babel',
    ],
    typescript: {
        check: false, // `false` is default value, but `checked` field is required in types.
        reactDocgen: 'react-docgen-typescript',
    },
    webpackFinal: async (config) => {
        const uiCoreConfig = await configureWebpackConfigForStorybook('production', {
            includes: [path.resolve(__dirname, '../src')],
            fallback: {
                path: require.resolve('path-browserify'),
                fs: false,
            },
        });

        config.plugins!.unshift(...uiCoreConfig.plugins);
        config.resolve = {
            ...config.resolve,
            ...uiCoreConfig.resolve,
            alias: {
                ...config.resolve!.alias,
                ...uiCoreConfig.resolve.alias,
            },
            modules: [...config.resolve!.modules!, ...uiCoreConfig.resolve.modules],
            extensions: [...config.resolve!.extensions!, ...uiCoreConfig.resolve.extensions],
        };
        config.module = {
            ...config.module,
            rules: uiCoreConfig.module.rules,
        };

        return config;
    },
};

export default config;
