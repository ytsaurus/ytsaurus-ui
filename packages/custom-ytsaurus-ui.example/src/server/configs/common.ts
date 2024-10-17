import path from 'path';

import {CustomAppConfig} from '../../custom-shared/types';
import {defaultUserSettingsOverrides} from '../_custom/settings-overrides';

import commonConfig from '../../ytsaurus-ui.server/configs/common';

const cfg: Partial<CustomAppConfig> = {
    ...commonConfig,
    appName: 'custom-ytsaurus-ui',

    ytInterfaceSecret: path.resolve(__dirname, '../../../secrets/yt-interface-secret.json'),
    clustersConfigPath: path.resolve(__dirname, '../../../clusters-config.json'),

    odinBaseUrl: 'https://odin.yt.my.domain',

    uiSettings: {
        directDownload: true,

        jupyterBasePath: 'https://jupyter.my.domain',
        reHashFromNodeVersion: '[^~]+~(?<hash>[^+]+)',

        reShortNameFromAddress: '(?<shortname>.*)(\\.[^.]+)(\\.yt\\.my\\.domain)',
        reShortNameSystemPage: '(?<shortname>.*)(\\.[^.]+)(\\.yt\\.my\\.domain)',
        reShortNameFromTabletNodeAddress: '(?<shortname>[^-]+-[^-]+).*',

        reUnipikaAllowTaggedSources: [
            '^https://([\\w-]+\\.)?s3\\.my\\.domain(:443)?/',
            '^https://static\\.my\\.domain/audio/',
            '^https://static\\.my\\.domain/video/',
        ],

        schedulingDenyRootAsParent: true,

        myUiOption: 'test',
    },

    defaultUserSettingsOverrides,
};

export default cfg;
