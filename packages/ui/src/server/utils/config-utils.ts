import type {Request} from '../../@types/core';
import {mergeUiSettings} from '../../shared/utils/merge-ui-settings';
import {getPreloadedClusterUiConfig} from '../components/cluster-params';
import {type UISettingsBaseUrlKeys, getBaseUrlDetails} from '../../shared/utils/base-url';

export async function getBaseUrlFromConfiguration(
    req: Request,
    {
        cluster,
        isDeveloper,
        uiSettingsFieldName,
    }: {
        cluster: string;
        isDeveloper: boolean;
        uiSettingsFieldName: UISettingsBaseUrlKeys;
    },
) {
    const uiSettings = await getClusterSpecificUiSettings(req, {
        cluster,
        isDeveloper,
    });

    return getBaseUrlDetails(uiSettings, uiSettingsFieldName);
}

export async function getClusterSpecificUiSettings(
    req: Request,
    {cluster, isDeveloper}: {cluster: string; isDeveloper: boolean},
) {
    const {uiSettings} = req.ctx.config;
    const uiConfig = await getPreloadedClusterUiConfig(cluster, req.ctx, isDeveloper);
    return mergeUiSettings({uiSettings, uiConfig});
}
