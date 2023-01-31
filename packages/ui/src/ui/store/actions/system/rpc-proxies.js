import {Toaster} from '@gravity-ui/uikit';

import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import createActionTypes from '../../../constants/utils';
import Updater from '../../../utils/hammer/updater';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

export const FETCH_RPC_PROXIES = createActionTypes('RPC_PROXIES');
const RPC_PROXIES_UPDATER_ID = 'system_rpcproxies';

const toaster = new Toaster();
const updater = new Updater();

export function loadRPCProxies() {
    return (dispatch) => {
        updater.add(RPC_PROXIES_UPDATER_ID, () => dispatch(getRPCProxies()), 30 * 1000);
    };
}

export function cancelLoadRPCProxies() {
    return () => {
        updater.remove(RPC_PROXIES_UPDATER_ID);
    };
}

function getRPCProxies() {
    return (dispatch) => {
        dispatch({
            type: FETCH_RPC_PROXIES.REQUEST,
        });

        return ytApiV3Id
            .get(YTApiId.systemRpcProxies, {
                path: '//sys/rpc_proxies',
                attributes: ['role'],
                suppress_transaction_coordinator_sync: true,
                suppress_upstream_sync: true,
            })
            .then((data = []) => {
                dispatch({
                    type: FETCH_RPC_PROXIES.SUCCESS,
                    data: data,
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_RPC_PROXIES.FAILURE,
                    data: error,
                });

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.createToast({
                    name: 'load/system/rpc-proxies',
                    allowAutoHiding: false,
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
