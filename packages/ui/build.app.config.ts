import {ServiceConfig} from '@gravity-ui/app-builder';
import {container} from 'webpack';

const client: ServiceConfig['client'] = {
    includes: ['node_modules/clusters-config', 'src/shared'],
    images: ['img'],
    icons: ['img/svg'],
    monaco: {
        filename: '[name].[hash:8].worker.js',
        languages: ['markdown', 'json'],
    },
    hiddenSourceMap: false,
    disableReactRefresh: true,
    webpack: (config) => {
        config.plugins?.push(
            new container.ModuleFederationPlugin({
                name: "host",
                remotes: {
                    datalensui: 'datalensui@https://datalens.yeee737-vm.ui.nebius.com/build/remoteEntry.js',
                },
                remoteType: 'script',
                shared: {
                    'react': {
                        singleton: true,
                        requiredVersion: '^18.2.0',
                    },
                    'react-dom': {
                        singleton: true,
                        requiredVersion: '^18.2.0',
                    }
                }
            }),
        );

        return config;
    }
};

const server: ServiceConfig['server'] = {
    watch: ['dist/shared'],
    watchThrottle: 1000,
};

export default {client, server};
