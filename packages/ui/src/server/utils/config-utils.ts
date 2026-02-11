// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import type {Request} from '../../@types/core';
import {UISettings} from '../../shared/ui-settings';
import {ClusterUiConfig, CypressNodeRaw} from '../../shared/yt-types';
import {getPreloadedClusterUiConfig} from '../components/cluster-params';
import {KeysByType} from '../../@types/types';

type UIConfigKeys = KeysByType<
    ClusterUiConfig,
    CypressNodeRaw<{testing: boolean}, string> | undefined
>;
type UISettingsKeys = KeysByType<UISettings, string | undefined>;

export async function getBaseUrlFromConfiguration(
    req: Request,
    {
        cluster,
        isDeveloper,
        uiConfigFieldName,
        uiSettingsFieldName,
    }: {
        cluster: string;
        isDeveloper: boolean;
        uiConfigFieldName: UIConfigKeys;
        uiSettingsFieldName: UISettingsKeys;
    },
): Promise<{baseUrl?: string; testing?: boolean}> {
    let baseUrl = (await getPreloadedClusterUiConfig(cluster, req.ctx, isDeveloper))[
        uiConfigFieldName
    ];

    if (!baseUrl) {
        baseUrl = req.ctx.config.uiSettings[uiSettingsFieldName];
    }

    if (!baseUrl) {
        return {};
    }

    const testing = ypath.get(baseUrl, '/@testing');
    const res = typeof baseUrl === 'string' ? baseUrl : baseUrl?.$value;
    return {
        baseUrl: res.endsWith('/') ? res.slice(0, -1) : res,
        testing,
    };
}
