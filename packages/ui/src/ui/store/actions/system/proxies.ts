import axios from 'axios';
import map_ from 'lodash/map';

import {Toaster} from '@gravity-ui/uikit';

import Updater from '../../../utils/hammer/updater';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import {getCluster} from '../../../store/selectors/global';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import type {HttpProxiesAction, RoleGroupItemInfo} from '../../../store/reducers/system/proxies';
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

                toaster.add({
                    name: 'load/system/proxies',
                    autoHiding: false,
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
