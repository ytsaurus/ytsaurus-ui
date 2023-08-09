import axios from '../../../utils/axios-no-xsrf';
import {Toaster} from '@gravity-ui/uikit';

import Updater from '../../../utils/hammer/updater';
import createActionTypes from '../../../constants/utils';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import {getCluster} from '../../../store/selectors/global';

export const FETCH_PROXIES = createActionTypes('PROXIES');
const PROXIES_UPDATER_ID = 'system_proxies';

const toaster = new Toaster();
const updater = new Updater();

export function loadProxies() {
    return (dispatch) => {
        updater.add(PROXIES_UPDATER_ID, () => dispatch(getProxies()), 30 * 1000);
    };
}

export function cancelLoadProxies() {
    return () => {
        updater.remove(PROXIES_UPDATER_ID);
    };
}

function getProxies() {
    return (dispatch, getState) => {
        const cluster = getCluster(getState());

        return axios
            .request({
                url: `/api/yt-proxy/${cluster}/hosts-all`,
                method: 'GET',
            })
            .then((response) => {
                dispatch({
                    type: FETCH_PROXIES.SUCCESS,
                    data: response.data,
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
