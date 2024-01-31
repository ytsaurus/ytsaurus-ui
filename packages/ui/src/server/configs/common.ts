import typeis from 'type-is';

import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';

const path = require('path');

const ytAuthConfig: Partial<AppConfig> = {
    allowPasswordAuth: Boolean(process.env.ALLOW_PASSWORD_AUTH),
    ytAuthAllowInsecure: Boolean(process.env.YT_AUTH_ALLOW_INSECURE),
    appAuthPolicy: AuthPolicy.required,
    userSettingsConfig: {
        mapNodePath: process.env.YT_USER_SETTINGS_PATH ?? '//tmp',
    },
    ...(process.env.YT_USER_COLUMN_PRESETS_PATH
        ? {
              userColumnPresets: {
                  dynamicTablePath: process.env.YT_USER_COLUMN_PRESETS_PATH,
              },
          }
        : {}),
};

const config: Partial<AppConfig> = {
    appName: 'YTSaurus',
    appSocket: 'dist/run/server.sock',
    appAuthPolicy: (process.env.AUTH_POLICY as AuthPolicy) || 'redirect',

    ...ytAuthConfig,

    // TODO: fix me
    // csp: 'disabled',

    ytInterfaceSecret: path.resolve(__dirname, '../../../secrets/yt-interface-secret.json'),
    clustersConfigPath: path.resolve(__dirname, '../../../clusters-config.json'),
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

    uiSettings: {
        reHashFromNodeVersion: '[^~]+~(?<hash>[^+]+)',
        directDownload: true,
        docsBaseUrl: process.env.YT_DOCS_BASE_URL || 'https://ytsaurus.tech/docs/en',
    },
};

export default config;
