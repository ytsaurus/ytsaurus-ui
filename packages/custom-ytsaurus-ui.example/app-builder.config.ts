import type {ServiceConfig} from '@gravity-ui/app-builder';
import path from 'path';
import fs from 'fs';

const analyzeBundle: Required<ServiceConfig>['client']['analyzeBundle'] = process.env
    .ANALYZE_BUNDLE as any;

const debugPort = process.env.DEBUG_PORT ? Number(process.env.DEBUG_PORT) : undefined;
const useRspack = ['1', 'true'].includes(String(process.env.USE_RSPACK).toLowerCase());
const rspackConfig: Pick<ServiceConfig['client'], 'bundler' | 'cache' | 'javaScriptLoader'> = {
    bundler: 'rspack',
    javaScriptLoader: 'swc',
    cache: true,
};

const uiLink = fs.readlinkSync(path.resolve(__dirname, 'src/ytsaurus-ui.ui'));
const includesByLinks = [uiLink, fs.readlinkSync(path.resolve(__dirname, 'src/shared'))];

export default function () {
    return {
        client: {
            ...(useRspack ? rspackConfig : {}),
            swc(config) {
                if (config.jsc?.transform?.optimizer) {
                    // simplify breaks Monaco's process detection in production builds.
                    config.jsc.transform.optimizer.simplify = false;
                }
                return config;
            },
            alias: {
                // monaco-vim uses legacy paths that Monaco 0.56 no longer exports.
                'monaco-editor/esm/vs': path.resolve(
                    require.resolve('monaco-editor/editor/editor.api'),
                    '../..',
                ),
            },
            watchOptions: {
                aggregateTimeout: 1000,
            },
            vendors: ['@ytsaurus/javascript-wrapper/lib/yt'],
            includes: ['src/shared', 'src/ytsaurus.ui', 'src/custom-shared', ...includesByLinks],
            images: [
                'src/ui/_custom/img',
                'src/ytsaurus-ui.ui/assets/img',
                path.resolve(uiLink, 'assets/img'),
            ],
            icons: [
                'src/ui/_custom/icons',
                'src/ytsaurus-ui.ui/img/svg',
                path.resolve(uiLink, 'assets/img/svg'),
            ],
            monaco: {
                filename: '[name].[hash:8].worker.js',
                languages: ['markdown', 'json'],
            },
            hiddenSourceMap: false,
            disableReactRefresh: true,
            analyzeBundle,
        },
        server: {
            watch: ['dist/custom-shared', 'dist/shared', 'dist/ytsaurus-ui.server'],
            watchThrottle: 1000,
            inspectBrk: debugPort,
        },
    } as ServiceConfig;
}
