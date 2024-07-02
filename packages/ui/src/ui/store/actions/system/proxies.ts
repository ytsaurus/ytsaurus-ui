import axios from 'axios';
import map_ from 'lodash/map';

import {Toaster} from '@gravity-ui/uikit';

import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import {getCluster} from '../../../store/selectors/global';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import type {HttpProxiesAction, RoleGroupItemInfo} from '../../../store/reducers/system/proxies';
import {ThunkAction} from 'redux-thunk';
import type {RootState} from '../../../store/reducers';
import {FETCH_PROXIES} from '../../../constants/system/nodes';

const toaster = new Toaster();

type ProxiesThunkAction<T = void> = ThunkAction<T, RootState, unknown, HttpProxiesAction>;

function makeProxyInfo(data: any): RoleGroupItemInfo {
    const state = data.dead ? 'offline' : 'online';

    return {
        name: data.name,
        state,
        effectiveState: state,
        role: data.role,
        banned: data.banned,
    };
}

export function loadSystemProxies(): ProxiesThunkAction<
    Promise<undefined | {isRetryFutile: boolean}>
> {
    return (dispatch, getState) => {
        const cluster = getCluster(getState());

        return axios
            .request({
                url: `/api/yt-proxy/${cluster}/hosts-all`,
                method: 'GET',
            })
            .then(({data}) => {
                const proxies = map_(data, makeProxyInfo);
                dispatch({
                    type: FETCH_PROXIES.SUCCESS,
                    data: {
                        roleGroups: extractRoleGroups(proxies),
                        counters: extractProxyCounters(proxies),
                    },
                });
                return undefined;
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_PROXIES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.add({
                    name: 'load/system/proxies',
                    autoHiding: false,
                    theme: 'danger',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Proxies',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });

                return {isRetryFutile: isRetryFutile(error.code)};
            });
    };
}
