import type {ServiceConfig} from '@gravity-ui/app-builder';
import path from 'path';

const analyzeBundle: Required<ServiceConfig>['client']['analyzeBundle'] = process.env
    .ANALYZE_BUNDLE as any;

const debugPort = process.env.DEBUG_PORT ? Number(process.env.DEBUG_PORT) : undefined;
const port = Number(process.env.LOCAL_DEV_PORT);

const client: ServiceConfig['client'] = {
    bundler: 'rspack',
    javaScriptLoader: 'swc',
    cache: true,
    watchOptions: {
        aggregateTimeout: 1000,
    },
    includes: ['src/shared'],
    images: ['src/ui/assets/img'],
    icons: ['src/ui/assets/img/svg'],
    monaco: {
        filename: '[name].[hash:8].worker.js',
        languages: ['markdown', 'json'],
    },
    hiddenSourceMap: false,
    disableReactRefresh: true,
    analyzeBundle,
    rspack(config) {
        config.resolve ??= {};
        config.resolve.alias = {
            ...config.resolve.alias,
            // monaco-vim uses legacy paths that Monaco 0.56 no longer exports.
            'monaco-editor/esm/vs': path.resolve(
                require.resolve('monaco-editor/editor/editor.api'),
                '../..',
            ),
        };
        return config;
    },

    ...(port
        ? {
              devServer: {
                  port,
              },
          }
        : null),
};

const server: ServiceConfig['server'] = {
    watch: ['dist/shared'],
    watchThrottle: 1000,
    inspectBrk: debugPort,

    ...(port
        ? {
              port: port + 1,
          }
        : null),
};

export default {client, server};
