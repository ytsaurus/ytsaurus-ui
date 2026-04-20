import {YT} from '../../../config/yt-config';
import {type RootState} from '../../../store/reducers';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

const selectIsDeveloper = (state: RootState): boolean => state?.global?.isDeveloper;

const selectIsWatchmen = (state: RootState): boolean => state?.global?.isWatchmen;

export const selectIsDeveloperOrWatchmen = (state: RootState): boolean => {
    const isDeveloper = selectIsDeveloper(state);
    const isWatchmen = selectIsWatchmen(state);

    return YT.isLocalCluster || isWatchmen || isDeveloper;
};

const selectSettingsRegularUserUI = (state: RootState) => {
    return getSettingsData(state)['global::development::regularUserUI'];
};

export const selectIsAdmin = (state: RootState): boolean => {
    const isDeveloperOrWatchmen = selectIsDeveloperOrWatchmen(state);
    const regularUserUI = selectSettingsRegularUserUI(state);

    return !regularUserUI && isDeveloperOrWatchmen;
};
