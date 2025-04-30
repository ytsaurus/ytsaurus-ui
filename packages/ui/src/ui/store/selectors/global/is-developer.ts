import {createSelector} from 'reselect';

import {YT} from '../../../config/yt-config';
import {RootState} from '../../../store/reducers';
import {NAMESPACES, SettingName} from '../../../../shared/constants/settings';
import {makeGetSetting} from '../../../store/selectors/settings';

import {getCurrentUserName} from './username';

import UIFactory from '../../../UIFactory';

const isDeveloperRaw = (state: RootState): boolean => state?.global?.isDeveloper;

export const isDeveloperOrWatchMen = createSelector(
    [isDeveloperRaw, getCurrentUserName],
    (isDeveloper, login) => {
        return YT.isLocalCluster || UIFactory.isWatchMen(login) || isDeveloper;
    },
);

const getSettingsRegularUserUI = createSelector(makeGetSetting, (getSetting) => {
    return getSetting(SettingName.DEVELOPMENT.REGULAR_USER_UI, NAMESPACES.DEVELOPMENT) || false;
});

export const isDeveloper = createSelector(
    [isDeveloperOrWatchMen, getSettingsRegularUserUI],
    (isDeveloperStatus, regularUserUI) => {
        return !regularUserUI && isDeveloperStatus;
    },
);
