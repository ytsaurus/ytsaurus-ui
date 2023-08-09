import axios from 'axios';
import map_ from 'lodash/map';

import ypath from '../../../common/thor/ypath';

import {Toaster} from '@gravity-ui/uikit';

import Updater from '../../../utils/hammer/updater';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import {getCluster} from '../../../store/selectors/global';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import type {HttpProxiesAction, ProxyInfo} from '../../../store/reducers/system/proxies';
import {ThunkAction} from 'redux-thunk';
import type {RootState} from '../../../store/reducers';
import {FETCH_PROXIES} from '../../../constants/system/nodes';

const PROXIES_UPDATER_ID = 'system_proxies';

const toaster = new Toaster();
const updater = new Updater();

type ProxiesThunkAction = ThunkAction<void, RootState, unknown, HttpProxiesAction>;

export function loadProxies(): ProxiesThunkAction {
    return (dispatch) => {
        updater.add(PROXIES_UPDATER_ID, () => dispatch(getProxies()), 30 * 1000);
    };
}

export function cancelLoadProxies() {
    return () => {
        updater.remove(PROXIES_UPDATER_ID);
    };
}

function makeProxyInfo(data: any): ProxyInfo {
    const state = data.dead ? 'offline' : 'online';
    const banned = data.banned;
    const liveness = data.liveness;

    return {
        name: data.name,
        host: data.name,
        state,
        banned,
        banMessage: data.ban_message || 'Ban message omitted',
        effectiveState: banned ? 'banned' : state,
        role: data.role,
        liveness,
        loadAverage: ypath.getValue(liveness, '/load_average'),
        updatedAt: ypath.getValue(liveness, '/updated_at'),
        networkLoad: ypath.getValue(liveness, '/network_coef'),
    };
}

function getProxies(): ProxiesThunkAction {
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
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_PROXIES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.createToast({
                    name: 'load/system/proxies',
                    allowAutoHiding: false,
                    type: 'error',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Proxies',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });

                if (isRetryFutile(error.code)) {
                    dispatch(cancelLoadProxies());
                }
            });
    };
}
