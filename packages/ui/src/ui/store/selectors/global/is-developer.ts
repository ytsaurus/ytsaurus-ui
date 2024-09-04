import {createSelector} from 'reselect';

import YT from '../../../config/yt-config';
import {RootState} from '../../../store/reducers';
import {getSettingsRegularUserUI} from '../../../store/selectors/settings-ts';

import {getCurrentUserName} from './username';

import UIFactory from '../../../UIFactory';

const isDeveloperRaw = (state: RootState): boolean => state?.global?.isDeveloper;

export const isDeveloperOrWatchMen = createSelector(
    [isDeveloperRaw, getCurrentUserName],
    (isDeveloper, login) => {
        return YT.isLocalCluster || UIFactory.isWatchMen(login) || isDeveloper;
    },
);

export const isDeveloper = createSelector(
    [isDeveloperOrWatchMen, getSettingsRegularUserUI],
    (isDeveloper, regularUserUI) => {
        return !regularUserUI && isDeveloper;
    },
);
