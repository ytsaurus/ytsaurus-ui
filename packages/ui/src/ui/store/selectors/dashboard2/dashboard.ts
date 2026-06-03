import {createSelector} from '@reduxjs/toolkit';

import {type RootState} from '../../../store/reducers';
import {selectSettingsData} from '../../../store/selectors/settings/settings-base';
import {selectCluster} from '../../../store/selectors/global';

import {dashboardConfig} from '../../../constants/dashboard2';

import {makeDefaultConfig} from '../../../utils/dashboard2/make-default-config';

export const selectDashboardConfig = createSelector(
    [selectSettingsData, selectCluster],
    (data, cluster) => {
        // if user setuped his dashboard on current cluster no need to retrun default values
        if (
            data[`local::${cluster}::dashboard::config`] &&
            data[`local::${cluster}::dashboard::config`]?.salt !== dashboardConfig.salt
        ) {
            return data[`local::${cluster}::dashboard::config`];
        }

        return makeDefaultConfig();
    },
);

export const selectSettingNewDashboardPage = (state: RootState) =>
    selectSettingsData(state)['global::newDashboardPage'];
