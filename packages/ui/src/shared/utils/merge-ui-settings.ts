import {UISettings} from '../ui-settings';
import {ClusterUiConfig} from '../yt-types';

export function mergeUiSettings({
    uiSettings,
    uiConfig,
}: {
    uiSettings: Partial<UISettings>;
    uiConfig: ClusterUiConfig;
}) {
    return {...uiSettings, ...uiConfig?.ui_settings} as typeof uiSettings;
}
