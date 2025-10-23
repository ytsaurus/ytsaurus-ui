import typeis from 'type-is';

import {AppConfig} from '@gravity-ui/nodekit';

const localModeConfig: Partial<AppConfig> = {
    ytAuthAllowInsecure: true,

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
