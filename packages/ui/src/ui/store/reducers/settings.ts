import remoteProvider, {SettingsProvider} from '../../common/utils/settings-remote-provider';

import localProvider from '../../common/utils/settings-local-provider';

import {SET_SETTING_VALUE, UNSET_SETTING_VALUE, UPDATE_SETTING_DATA} from '../../constants/index';
import {getSettingsDataFromInitialConfig} from '../../config';
import YT from '../../config/yt-config';
import {ActionD} from '../../types';

export interface SettingsState {
    provider: SettingsProvider;
    data: Record<string, unknown>;
}

const initialState: SettingsState = getInitialState();

function getInitialState() {
    const {
        parameters: {login},
    } = YT;
    const settings = getSettingsDataFromInitialConfig();
    const {
        data,
        meta: {useRemoteSettings, errorMessage},
    } = settings;

    if (errorMessage) {
        console.error(errorMessage);
    }

    return {
        provider: useRemoteSettings ? remoteProvider : localProvider,
        // In case of disabled remote user settings we have to merge
        // default settings from server with settings from localStorage
        data: useRemoteSettings ? data : {...data, ...localProvider.getAll(login, '')},
    };
}

function updatedSettingValue<T>(state: SettingsState, path: string, value: T) {
    const {data, ...rest} = state;
    return {data: {...data, [path]: value}, ...rest};
}

function removedSetting(state: SettingsState, path: string) {
    const {data, ...rest} = state;
    const {[path]: _value, ...restData} = data; // eslint-disable-line no-unused-vars

    return {...rest, data: restData};
}

export default (state = initialState, action: SettingsAction) => {
    switch (action.type) {
        case SET_SETTING_VALUE:
            return updatedSettingValue(state, action.data.path, action.data.value);

        case UNSET_SETTING_VALUE:
            return removedSetting(state, action.data.path);

        case UPDATE_SETTING_DATA:
            return {...state, data: {...state.data, ...action.data}};

        default:
            return state;
    }
};

export type SettingsAction =
    | ActionD<typeof SET_SETTING_VALUE, {path: string; value: any}>
    | ActionD<typeof UNSET_SETTING_VALUE, {path: string}>
    | ActionD<typeof UPDATE_SETTING_DATA, object>;
