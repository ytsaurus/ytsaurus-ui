import type {ThunkAction} from 'redux-thunk';

import type {RootState} from '../../../store/reducers';
import type {SettingsAction} from '../../../store/reducers/settings';
import type {DescribedSettings, SettingKey} from '../../../../shared/constants/settings-types';

import {SET_SETTING_VALUE} from '../../../constants/index';
import {showToasterError} from '../../../utils/utils';
import {getCurrentUserName, getSettingsCluster} from '../../selectors/global';
import {getSettingsData} from '../../../store/selectors/settings/settings-base';

export type SettingsThunkAction<T = Promise<void>> = ThunkAction<
    T,
    RootState,
    unknown,
    SettingsAction<keyof DescribedSettings>
>;

function logError(action: string, name: string) {
    // eslint-disable-next-line no-console
    console.error('Failed to "%s" setting "%s", settings provider is disabled.', action, name);
}

export function setSettingByKey<K extends SettingKey, T extends DescribedSettings[K]>(
    path: K,
    value: T,
    options?: {silent?: boolean},
): SettingsThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const {
            settings: {provider},
        } = state;
        const data = getSettingsData(state);
        const login = getCurrentUserName(state);
        const cluster = getSettingsCluster(getState());

        const previousValue = data[path];

        dispatch({
            type: SET_SETTING_VALUE,
            data: {path, value},
        });

        return provider.set(login, path, value, cluster!).catch((error) => {
            if (error === 'disabled') {
                logError('set', path);
                return;
            }

            dispatch({
                type: SET_SETTING_VALUE,
                data: {path, value: previousValue},
            });

            if (!options?.silent) {
                showToasterError(`Set ${path}`, error);
            }

            throw error;
        });
    };
}
