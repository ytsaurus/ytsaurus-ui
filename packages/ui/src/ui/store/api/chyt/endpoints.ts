import {BaseQueryApi} from '@reduxjs/toolkit/query';

import {RootState} from '../../../store/reducers';
import {selectClusterUiConfig} from '../../../store/selectors/global';

import {StrawberryApiType, chytApiAction} from '../../../utils/strawberryControllerApi';

export function chytFetch(args: Parameters<StrawberryApiType>, api: BaseQueryApi) {
    try {
        const state = api.getState() as RootState;
        const chytAllowed = Boolean(selectClusterUiConfig(state).chyt_controller_base_url);
        if (!chytAllowed) {
            throw new Error('CHYT is not allowed on current cluster');
        }
        const data = chytApiAction(...args);
        return {data};
    } catch (error) {
        return {error};
    }
}
