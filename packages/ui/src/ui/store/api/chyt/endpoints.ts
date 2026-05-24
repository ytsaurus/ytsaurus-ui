import {type BaseQueryApi} from '@reduxjs/toolkit/query';

import {type RootState} from '../../../store/reducers';
import {selectClusterUiConfig} from '../../../store/selectors/global';

import {type StrawberryApiType, chytApiAction} from '../../../utils/strawberryControllerApi';
import i18n from './i18n';

export function chytFetch(args: Parameters<StrawberryApiType>, api: BaseQueryApi) {
    try {
        const state = api.getState() as RootState;
        const chytAllowed = Boolean(selectClusterUiConfig(state).chyt_controller_base_url);
        if (!chytAllowed) {
            throw new Error(i18n('alert_chyt-not-allowed'));
        }
        const data = chytApiAction(...args);
        return {data};
    } catch (error) {
        return {error};
    }
}
