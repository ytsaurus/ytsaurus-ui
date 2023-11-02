import {ServiceConfig} from '@gravity-ui/app-builder';

const client: ServiceConfig['client'] = {
    includes: ['node_modules/clusters-config', 'src/shared'],
    images: ['img'],
    icons: ['img/svg'],
    monaco: {
        filename: '[name].[hash:8].worker.js',
        languages: ['markdown'],
    },
    hiddenSourceMap: false,
    disableReactRefresh: true,
};

const server: ServiceConfig['server'] = {
    watch: ['dist/shared'],
    watchThrottle: 1000,
};

export default {client, server};
