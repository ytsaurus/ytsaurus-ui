import typeis from 'type-is';

import {AuthPolicy} from '@gravity-ui/expresskit';
import {AppConfig} from '@gravity-ui/nodekit';

const localModeConfig: Partial<AppConfig> = {
    appAuthPolicy: AuthPolicy.disabled,
    ytInterfaceSecret: undefined,

    expressBodyParserJSONConfig: {
        limit: '51mb',
        type(req) {
            // Enable raw parser for all content-types on yt-api for piping requests
            if (req.url?.startsWith('/api/yt/')) return true;
            if (req.url?.startsWith('/localmode/api/yt/')) return false;

            // Simulate default logic given that 'type' option is 'multiform-data'
            // https://github.com/expressjs/body-parser/blob/1f6f58e1f8dc222f2b6cfc7eb3a3bf5145ff2b56/lib/types/raw.js#L99
            return Boolean(typeis(req, 'multipart/form-data'));
        },
    },

    uiSettings: {
        newTableReplicasCount: 1,
        uploadTableMaxSize: 50 * 1024 * 1024,
        uploadTableUseLocalmode: true,
        queryTrackerStage: 'testing',

        directDownload: false,
    },
};

export default localModeConfig;
