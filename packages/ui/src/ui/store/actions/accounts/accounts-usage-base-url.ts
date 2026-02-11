import {ClusterUiConfig} from '../../../../shared/yt-types';
import thorYPath from '../../../common/thor/ypath';
import {RootState} from '../../../store/reducers';
import {getClusterUiConfig} from '../../../store/selectors/global/cluster';

export function calcBaseUrl(url: string, state: RootState) {
    const uiConfig = getClusterUiConfig(state);
    return calcAccountsUsageBaseUrl(uiConfig, url);
}

export function calcAccountsUsageBaseUrl(uiConfig: ClusterUiConfig, url: string) {
    const {resource_usage_base_url} = uiConfig;
    const use_cors = thorYPath.getValue(resource_usage_base_url, '/@use_cors');
    return use_cors
        ? thorYPath.getValue(resource_usage_base_url) + `/${url.split('/').pop()}`
        : url;
}
