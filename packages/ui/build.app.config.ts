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

const isDev = process.env.APP_ENV === 'development';

const port = Number(process.env.LOCAL_DEV_PORT);

const devConfig = {
    bundler: 'rspack',
    javaScriptLoader: 'swc',
    cache: 'true',
};

const client: ServiceConfig['client'] = {
    ...(isDev ? devConfig : {}),
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

    ...(port ? {
        devServer: {
            port,
        }
    }: null),
};

const server: ServiceConfig['server'] = {
    watch: ['dist/shared'],
    watchThrottle: 1000,
    inspectBrk: debugPort,

    ...(port ? {
        port: port + 1,
    }: null),
};

export default {client, server};
