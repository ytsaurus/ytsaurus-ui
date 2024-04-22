import {CustomAppConfig} from '../../custom-shared/types';

import commonConfig from './common';

const config: Partial<CustomAppConfig> = {
    appName: `${commonConfig.appName}.development`,
    uiSettings: {
        ...commonConfig.uiSettings,
        myUiOption: 'myUiOptionForProd',
    },

    userSettingsConfig: {
        mapNodePath: '//tmp',
    },

    userColumnPresets: {
        dynamicTablePath: '//home/yt-interface/table-columns-preset',
    },
};

export default config;
