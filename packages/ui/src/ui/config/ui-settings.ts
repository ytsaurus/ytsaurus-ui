import type {ConfigData} from '../../shared/yt-types';

export function getConfigData(): ConfigData {
    return (window as any).__DATA__;
}

export const uiSettings: Partial<Required<ConfigData>['uiSettings']> =
    getConfigData()?.uiSettings || {};

export const userSettingsCluster: ConfigData['userSettingsCluster'] =
    getConfigData()?.userSettingsCluster;
