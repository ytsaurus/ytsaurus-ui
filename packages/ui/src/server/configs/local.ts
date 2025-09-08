import typeis from 'type-is';

import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';
import {ytAuthConfigFromEnv} from '../utils/configs/auth-config-from-env';

const localModeConfig: Partial<AppConfig> = {
    ...ytAuthConfigFromEnv,
    ytAuthAllowInsecure: true,
    appAuthPolicy: ytAuthConfigFromEnv ? AuthPolicy.required : AuthPolicy.disabled,

    ytInterfaceSecret: undefined,

    expressBodyParserJSONConfig: {
        limit: '51mb',
        type(req) {
            // Enable raw parser for all content-types on yt-api for piping requests
            if (req.url?.startsWith('/api/yt/')) return false;
            if (req.url?.startsWith('/localmode/api/yt/')) return false;

            // Simulate default logic given that 'type' option is 'application/json'
            return Boolean(typeis(req, 'application/json'));
        },
    },

    uiSettings: {
        newTableReplicasCount: 1,
        uploadTableMaxSize: 50 * 1024 * 1024,
        uploadTableUseLocalmode: true,
        queryTrackerStage: 'testing',
        directDownload: false,
        reportBugUrl: 'https://github.com/ytsaurus/ytsaurus-ui/issues/new',
    },
};

export default localModeConfig;
