import typeis from 'type-is';

import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';
import {applyAppEnvToConfig} from '../utils/configs/apply-app-env-to-config';

const path = require('path');

export const sharedConfig: Partial<AppConfig> = {
    appName: 'YTSaurus',
    appSocket: 'dist/run/server.sock',

    expressBodyParserJSONConfig: {
        strict: false,
        type(req: any) {
            // Disable JSON parser on yt-api to allow requests piping
            if (req.url?.startsWith('/api/yt/')) return false;

            // Simulate default logic given that 'type' option is 'application/json'
            return Boolean(typeis(req, 'application/json'));
        },
    },
    expressBodyParserURLEncodedConfig: {
        type(req) {
            // Disable urlencoded parser on yt-api
            if (req.url?.startsWith('/api/yt/')) return false;

            // Simulate default logic given that 'type' option is 'application/x-www-form-urlencoded'
            return Boolean(typeis(req, 'application/x-www-form-urlencoded'));
        },
    },
    expressBodyParserRawConfig: {
        limit: '21mb',
        type(req) {
            // Enable raw parser for all content-types on yt-api
            if (req.url?.startsWith('/api/yt/')) return true;

            // Simulate default logic given that 'type' option is 'multiform-data'
            return Boolean(typeis(req, 'multipart/form-data'));
        },
    },
};

const config: Partial<AppConfig> = applyAppEnvToConfig({
    ...sharedConfig,
    appAuthPolicy: AuthPolicy.required,

    // TODO: fix me
    // csp: 'disabled',

    ytInterfaceSecret: path.resolve(__dirname, '../../../secrets/yt-interface-secret.json'),
    clustersConfigPath: path.resolve(__dirname, '../../../clusters-config.json'),

    uiSettings: {
        reHashFromNodeVersion: '[^~]+~(?<hash>[^+]+)',
        directDownload: true,
    },
});

export default config;
