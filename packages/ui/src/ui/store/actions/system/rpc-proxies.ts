import {ThunkAction} from 'redux-thunk';

import reduce_ from 'lodash/reduce';

import {Toaster} from '@gravity-ui/uikit';

import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import Updater from '../../../utils/hammer/updater';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {FETCH_RPC_PROXIES} from '../../../constants/system/nodes';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import {RoleGroupItemInfo} from '../../../store/reducers/system/proxies';
import ypath from '../../../common/thor/ypath';
import {RootState} from '../../../store/reducers';
import {RpcProxiesAction} from '../../../store/reducers/system/rpc-proxies';
import {USE_SUPRESS_SYNC} from '../../../../shared/constants';

const RPC_PROXIES_UPDATER_ID = 'system_rpcproxies';

const updater = new Updater();

type RPCProxiesThunkAction = ThunkAction<void, RootState, unknown, RpcProxiesAction>;

export function loadRPCProxies(): RPCProxiesThunkAction {
    return (dispatch) => {
        updater.add(RPC_PROXIES_UPDATER_ID, () => dispatch(getRPCProxies()), 30 * 1000);
    };
}

export function cancelLoadRPCProxies() {
    return () => {
        updater.remove(RPC_PROXIES_UPDATER_ID);
    };
}

function extractRpcProxy(data: object): Array<RoleGroupItemInfo> {
    return reduce_(
        data,
        (acc, value, key) => {
            const alive = ypath.getValue(value, '/alive');
            const state = alive ? 'online' : 'offline';
            const banned = ypath.getValue(value, '/@banned');
            acc.push({
                name: key,
                role: ypath.getValue(value, '/@role'), //value.$attributes?.role,
                state,
                effectiveState: state,
                banned,
            });
            return acc;
        },
        [] as Array<RoleGroupItemInfo>,
    );
}

function getRPCProxies(): RPCProxiesThunkAction {
    return (dispatch) => {
        dispatch({
            type: FETCH_RPC_PROXIES.REQUEST,
        });

        return ytApiV3Id
            .get(YTApiId.systemRpcProxies, {
                path: '//sys/rpc_proxies',
                attributes: ['role', 'banned'],
                ...USE_SUPRESS_SYNC,
            })
            .then((data = []) => {
                const rpcProxies = extractRpcProxy(data);

                dispatch({
                    type: FETCH_RPC_PROXIES.SUCCESS,
                    data: {
                        roleGroups: extractRoleGroups(rpcProxies),
                        counters: extractProxyCounters(rpcProxies),
                    },
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_RPC_PROXIES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                const toaster = new Toaster();
                toaster.add({
                    name: 'load/system/rpc-proxies',
                    autoHiding: false,
                    type: 'error',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load RPC-Proxies',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });

                if (isRetryFutile(error.code)) {
                    dispatch(cancelLoadRPCProxies());
                }
            });
    };
}
