import remoteProvider, {SettingsProvider} from '../../common/utils/settings-remote-provider';

import localProvider from '../../common/utils/settings-local-provider';

import {SET_SETTING_VALUE, UNSET_SETTING_VALUE, UPDATE_SETTING_DATA} from '../../constants/index';
import {getConfigData} from '../../config/ui-settings';
import {YT} from '../../config/yt-config';
import {ActionD} from '../../types';
import {DescribedSettings} from '../../../shared/constants/settings-types';

export interface SettingsState {
    provider: SettingsProvider;
    data: Partial<DescribedSettings>;
}

const initialState: SettingsState = getInitialState();

export function getSettingsInitialData() {
    return initialState.data;
}

function getInitialState() {
    const {
        parameters: {login},
    } = YT;
    const settings = getConfigData().settings;
    const {
        data,
        meta: {useRemoteSettings, errorMessage},
    } = settings;

    if (errorMessage) {
        // eslint-disable-next-line no-console
        console.error(errorMessage);
    }

    return {
        provider: useRemoteSettings ? remoteProvider : localProvider,
        // In case of disabled remote user settings we have to merge
        // default settings from server with settings from localStorage
        data: useRemoteSettings ? data : {...data, ...localProvider.getAll(login, '')},
    };
}

function updatedSettingValue<K extends keyof DescribedSettings>(
    state: SettingsState,
    path: K,
    value: DescribedSettings[K],
) {
    const {data, ...rest} = state;
    return {data: {...data, [path]: value}, ...rest};
}

function removedSetting<K extends keyof DescribedSettings>(
    state: SettingsState,
    path: K,
): SettingsState {
    const {data, ...rest} = state;
    const {[path]: _value, ...restData} = data; // eslint-disable-line no-unused-vars

    return {...rest, data: restData};
}

function reducer<K extends keyof DescribedSettings>(
    state = initialState,
    action: SettingsAction<K>,
): SettingsState {
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
}

export type SettingsAction<K extends keyof DescribedSettings> =
    | ActionD<typeof SET_SETTING_VALUE, {path: K; value: DescribedSettings[K]}>
    | ActionD<typeof UNSET_SETTING_VALUE, {path: K}>
    | ActionD<typeof UPDATE_SETTING_DATA, Partial<DescribedSettings>>;

export default reducer;
