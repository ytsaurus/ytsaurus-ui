import {ThunkAction} from 'redux-thunk';

import reduce_ from 'lodash/reduce';

import {USE_SUPRESS_SYNC} from '../../../../shared/constants';
import ypath from '../../../common/thor/ypath';
import {FETCH_RPC_PROXIES} from '../../../constants/system/nodes';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import {RoleGroupItemInfo} from '../../../store/reducers/system/proxies';
import {RpcProxiesAction} from '../../../store/reducers/system/rpc-proxies';
import {isRetryFutile} from '../../../utils/index';
import {extractProxyCounters, extractRoleGroups} from '../../../utils/system/proxies';
import {showErrorPopup} from '../../../utils/utils';
import {toaster} from '../../../utils/toaster';

type RPCProxiesThunkAction<T = void> = ThunkAction<
    Promise<T>,
    RootState,
    unknown,
    RpcProxiesAction
>;

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

export function loadSystemRPCProxies(): RPCProxiesThunkAction<
    undefined | {isRetryFutile: boolean}
> {
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
                return undefined;
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_RPC_PROXIES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.add({
                    name: 'load/system/rpc-proxies',
                    autoHiding: false,
                    theme: 'danger',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load RPC-Proxies',
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
