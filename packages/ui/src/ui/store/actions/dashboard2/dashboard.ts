import {ThunkAction} from '@reduxjs/toolkit';

import {RootState} from '../../../store/reducers';
import {setSettingByKey} from '../../../store/actions/settings';

import {dashboardConfig} from '../../../constants/dashboard2';

export function importConfig(cluster: string): ThunkAction<any, RootState, any, any> {
    return (dispatch, getState) => {
        const state = getState();
        const currentCluster = state.global.cluster;
        const config = state.settings.data[`local::${cluster}::dashboard::config`];

        dispatch(
            setSettingByKey(
                `local::${currentCluster}::dashboard::config` as const,
                config ?? dashboardConfig,
            ),
        );
    };
}
