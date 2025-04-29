import {createSelector} from 'reselect';

import {YT} from '../../../config/yt-config';
import {RootState} from '../../../store/reducers';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

import {getCurrentUserName} from './username';

import UIFactory from '../../../UIFactory';

const isDeveloperRaw = (state: RootState): boolean => state?.global?.isDeveloper;

export const isDeveloperOrWatchMen = createSelector(
    [isDeveloperRaw, getCurrentUserName],
    (isDeveloper, login) => {
        return YT.isLocalCluster || UIFactory.isWatchMen(login) || isDeveloper;
    },
);

export const getSettingsRegularUserUI = (state: RootState) => {
    return getSettingsData(state)['global::development::regularUserUI'];
};

export const isDeveloper = createSelector(
    [isDeveloperOrWatchMen, getSettingsRegularUserUI],
    (isDeveloper, regularUserUI) => {
        return !regularUserUI && isDeveloper;
    },
);
