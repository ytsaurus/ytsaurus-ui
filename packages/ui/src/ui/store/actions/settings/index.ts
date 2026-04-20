import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../../store/reducers';
import {type SettingsAction} from '../../../store/reducers/settings';
import {type SettingNS, getPath} from '../../../../shared/utils/settings';
import {type DescribedSettings, type SettingKey} from '../../../../shared/constants/settings-types';

import {
    SET_SETTING_VALUE,
    UNSET_SETTING_VALUE,
    UPDATE_SETTING_DATA,
} from '../../../constants/index';
import {showToasterError, wrapApiPromiseByToaster} from '../../../utils/utils';
import {selectSettingsCluster} from '../../selectors/global';
import {setSettingByKey} from './settings-base';

export * from './settings-base';

function logError(action: string, name: string) {
    // eslint-disable-next-line no-console
    console.error('Failed to "%s" setting "%s", settings provider is disabled.', action, name);
}

export type SettingsThunkAction<T = Promise<void>> = ThunkAction<
    T,
    RootState,
    unknown,
    SettingsAction<keyof DescribedSettings>
>;

export function setSetting<T>(
    settingName: string,
    settingNS: SettingNS,
    value: T,
): SettingsThunkAction {
    return (dispatch) => {
        const path = getPath(settingName, settingNS) as SettingKey;
        return dispatch(
            setSettingByKey(path as SettingKey, value as DescribedSettings[typeof path]),
        );
    };
}

/**
 * @deprecated use corresponding method from settings-base.ts
 */
export function removeSetting(settingName: string, settingNS: SettingNS): SettingsThunkAction {
    const path = getPath(settingName, settingNS) as SettingKey;

    return (dispatch, getState) => {
        const {
            settings: {provider, data},
            global: {login},
        } = getState();
        const previousValue = data[path];
        const cluster = selectSettingsCluster(getState());

        dispatch({
            type: UNSET_SETTING_VALUE,
            data: {path},
        });

        return provider.remove(login, path, cluster!).catch((error) => {
            if (error === 'disabled') {
                logError('remove', settingName);
                return;
            }

            dispatch({
                type: SET_SETTING_VALUE,
                data: {path, value: previousValue},
            });

            showToasterError(`Remove ${path}`, error);

            throw error;
        });
    };
}

/**
 * @deprecated use corresponding method from settings-base.ts
 */
export function reloadSetting(settingName: string, settingNS: SettingNS): SettingsThunkAction {
    const path = getPath(settingName, settingNS) as SettingKey;

    return (dispatch, getState) => {
        const {
            settings: {provider},
            global: {login},
        } = getState();
        const cluster = selectSettingsCluster(getState());

        return provider
            .get(login, path, cluster!)
            .then((value) => {
                dispatch({
                    type: SET_SETTING_VALUE,
                    data: {path, value},
                });
            })
            .catch((error) => {
                if (error === 'disabled') {
                    logError('get', settingName);
                    return;
                }

                showToasterError(`Reload ${path}`, error);

                throw error;
            });
    };
}

export function reloadUserSettings(login: string): SettingsThunkAction {
    return async (dispatch, getState) => {
        try {
            const state = getState();
            const cluster = selectSettingsCluster(state);
            const ytAuthCluster = state.global.ytAuthCluster || cluster;
            const {provider} = state.settings;
            await provider.create(login, ytAuthCluster);
            const allData = provider.getAll(login, ytAuthCluster);

            const data: any =
                allData instanceof Promise
                    ? await wrapApiPromiseByToaster(allData, {
                          toasterName: 'reload-user-settings',
                          skipSuccessToast: true,
                          errorContent: 'Cannot load user settings',
                      })
                    : allData;
            dispatch({type: UPDATE_SETTING_DATA, data});
        } catch (e) {}
    };
}
