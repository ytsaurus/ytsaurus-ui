import typeis from 'type-is';

import {AuthPolicy} from '@gravity-ui/expresskit';
import {uiSettingFromEnv} from '../../shared/ui-settings';
import {CustomAppConfig} from '../../custom-shared/types';

const localModeConfig: Partial<CustomAppConfig> = {
    appAuthPolicy: AuthPolicy.disabled,
    ytInterfaceSecret: undefined,
    odinBaseUrl: undefined,

    expressBodyParserRawConfig: {
        limit: '51mb',
        type(req) {
            // Enable raw parser for all content-types on yt-api
            if (req.url?.startsWith('/api/yt/')) return true;
            if (req.url?.startsWith('/localmode/api/yt/')) return false;

            // Simulate default logic given that 'type' option is 'multiform-data'
            // https://github.com/expressjs/body-parser/blob/1f6f58e1f8dc222f2b6cfc7eb3a3bf5145ff2b56/lib/types/raw.js#L99
            return Boolean(typeis(req, 'multipart/form-data'));
        },
    },

    uiSettings: {
        ...uiSettingFromEnv,
        newTableReplicasCount: 1,
        uploadTableMaxSize: 50 * 1024 * 1024,
        uploadTableUseLocalmode: true,

        directDownload: false,
    },
};

export default localModeConfig;
