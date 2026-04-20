import {getBaseUrlDetails} from '../../../../shared/utils/base-url';
import {type RootState} from '../../../store/reducers';
import {selectMergedUiSettings} from '../../../store/selectors/global/cluster';

export function calcAccountsUsageBaseUrl(url: string, state: RootState) {
    const uiSettings = selectMergedUiSettings(state);
    const {baseUrl, use_cors} = getBaseUrlDetails(uiSettings, 'accountsUsageBasePath');
    return use_cors ? `${baseUrl}/${url.split('/').pop()}` : url;
}
