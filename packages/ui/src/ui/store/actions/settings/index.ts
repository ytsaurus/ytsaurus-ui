import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {SettingsAction} from '../../../store/reducers/settings';
import {SettingNS, getPath} from '../../../../shared/utils/settings';
import {SettingKey} from '../../../../shared/constants/settings-types';

import {
    SET_SETTING_VALUE,
    UNSET_SETTING_VALUE,
    UPDATE_SETTING_DATA,
} from '../../../constants/index';
import {showToasterError, wrapApiPromiseByToaster} from '../../../utils/utils';

function logError(action: string, name: string) {
    console.error('Failed to "%s" setting "%s", settings provider is disabled.', action, name);
}

export type SettingsThunkAction<T = Promise<void>> = ThunkAction<
    T,
    RootState,
    unknown,
    SettingsAction
>;

export function setSetting<T>(
    settingName: string,
    settingNS: SettingNS,
    value: T,
): SettingsThunkAction {
    return (dispatch) => {
        const path = getPath(settingName, settingNS);
        return dispatch(setSettingByKey(path as SettingKey, value));
    };
}

export function setSettingByKey<T>(path: SettingKey, value: T): SettingsThunkAction {
    return (dispatch, getState) => {
        const {
            settings: {provider, data},
            global: {login},
        } = getState();
        const previousValue = data[path];

        dispatch({
            type: SET_SETTING_VALUE,
            data: {path, value},
        });

        return provider.set(login, path, value).catch((error) => {
            if (error === 'disabled') {
                logError('set', path);
                return;
            }

            dispatch({
                type: SET_SETTING_VALUE,
                data: {path, value: previousValue},
            });

            showToasterError(`Set ${path}`, error);

            throw error;
        });
    };
}

export function removeSetting(settingName: string, settingNS: SettingNS): SettingsThunkAction {
    const path = getPath(settingName, settingNS);

    return (dispatch, getState) => {
        const {
            settings: {provider, data},
            global: {login},
        } = getState();
        const previousValue = data[path];

        dispatch({
            type: UNSET_SETTING_VALUE,
            data: {path},
        });

        return provider.remove(login, path).catch((error) => {
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

export function reloadSetting(settingName: string, settingNS: SettingNS): SettingsThunkAction {
    const path = getPath(settingName, settingNS);

    return (dispatch, getState) => {
        const {
            settings: {provider},
            global: {login},
        } = getState();

        return provider
            .get(login, path)
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
            const {provider} = state.settings;

            await provider.create(login);
            const data: any = await wrapApiPromiseByToaster(provider.getAll(login), {
                toasterName: 'reload-user-settings',
                skipSuccessToast: true,
                errorContent: 'Cannot load user settings',
            });
            dispatch({type: UPDATE_SETTING_DATA, data});
        } catch (e) {}
    };
}
