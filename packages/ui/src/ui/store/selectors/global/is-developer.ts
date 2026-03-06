import {YT} from '../../../config/yt-config';
import {RootState} from '../../../store/reducers';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

export const selectIsDeveloper = (state: RootState): boolean => state?.global?.isDeveloper;

export const selectIsWatchmen = (state: RootState): boolean => state?.global?.isWatchmen;

export const selectIsDeveloperOrWatchmen = (state: RootState): boolean => {
    const isDeveloper = selectIsDeveloper(state);
    const isWatchmen = selectIsWatchmen(state);

    return YT.isLocalCluster || isWatchmen || isDeveloper;
};

export const selectSettingsRegularUserUI = (state: RootState) => {
    return getSettingsData(state)['global::development::regularUserUI'];
};

export const selectIsAdmin = (state: RootState): boolean => {
    const isDeveloperOrWatchmen = selectIsDeveloperOrWatchmen(state);
    const regularUserUI = selectSettingsRegularUserUI(state);

    return !regularUserUI && isDeveloperOrWatchmen;
};
