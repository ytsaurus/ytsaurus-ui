// @ts-expect-error
import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import type {KeysByType} from '../../@types/types';
import type {UISettings, UiConfigBaseUrl} from '../../shared/ui-settings';

export type UISettingsBaseUrlKeys = KeysByType<UISettings, UiConfigBaseUrl | undefined>;

export function getBaseUrlDetails(
    uiSettings: Partial<UISettings>,
    key: UISettingsBaseUrlKeys,
): {baseUrl?: string; testing?: boolean; use_cors?: boolean} {
    const {[key]: baseUrl} = uiSettings;
    if (!baseUrl) {
        return {};
    }

    const testing = ypath.get(baseUrl, '/@testing');
    const use_cors = ypath.get(baseUrl, '/@use_cors');
    const res = typeof baseUrl === 'string' ? baseUrl : baseUrl?.$value;
    return {
        baseUrl: res.endsWith('/') ? res.slice(0, -1) : res,
        testing,
        use_cors,
    };
}
