import type {ServiceConfig} from '@gravity-ui/app-builder';
import path from 'path';
import fs from 'fs';

const analyzeBundle: Required<ServiceConfig>['client']['analyzeBundle'] = process.env
    .ANALYZE_BUNDLE as any;

if (analyzeBundle) {
    console.log({analyzeBundle}, '\n');
}

const debugPort = process.env.DEBUG_PORT ? Number(process.env.DEBUG_PORT) : undefined;
if (debugPort) {
    console.log({debugPort}, '\n');
}

const uiLink = fs.readlinkSync(path.resolve(__dirname, 'src/ytsaurus-ui.ui'));
const includesByLinks = [uiLink, fs.readlinkSync(path.resolve(__dirname, 'src/shared'))];

export default function () {
    return {
        client: {
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
