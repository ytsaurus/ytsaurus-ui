import {ServiceConfig} from '@gravity-ui/app-builder';

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
};

const server: ServiceConfig['server'] = {
    watch: ['dist/shared'],
    watchThrottle: 1000,
};

export default {client, server};
