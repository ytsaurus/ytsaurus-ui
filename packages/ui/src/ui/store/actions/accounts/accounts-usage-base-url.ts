import {getBaseUrlDetails} from '../../../../shared/utils/base-url';
import {RootState} from '../../../store/reducers';
import {getMergedUiSettings} from '../../../store/selectors/global/cluster';

export function calcAccountsUsageBaseUrl(url: string, state: RootState) {
    const uiSettings = getMergedUiSettings(state);
    const {baseUrl, use_cors} = getBaseUrlDetails(uiSettings, 'accountsUsageBasePath');
    return use_cors ? `${baseUrl}/${url.split('/').pop()}` : url;
}
