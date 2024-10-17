import {ServiceConfig} from '@gravity-ui/app-builder';

const analyzeBundle: Required<ServiceConfig>['client']['analyzeBundle'] = process.env
    .ANALYZE_BUNDLE as any;

if (analyzeBundle) {
    console.log({analyzeBundle}, '\n');
}

const debugPort = process.env.DEBUG_PORT ? Number(process.env.DEBUG_PORT) : undefined;
if (debugPort) {
    console.log({debugPort}, '\n');
}

const usePort = Boolean(process.env.USE_PORT);

const client: ServiceConfig['client'] = {
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

    ...(usePort ? {
        devServer: {
            port: 8080,
        }
    }: null),
};

const server: ServiceConfig['server'] = {
    watch: ['dist/shared'],
    watchThrottle: 1000,
    inspectBrk: debugPort,

    ...(usePort ? {
        port: 3000,
    }: null),
};

export default {client, server};
