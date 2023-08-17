import {Toaster} from '@gravity-ui/uikit';

import {getAgents, getSchedulers} from '../../../store/actions/system/schedulers';
import {FETCH_SCHEDULERS, SCHEDULERS_UPDATER_ID} from '../../../constants/system/schedulers';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';

import Updater from '../../../utils/hammer/updater';

const toaster = new Toaster();
const updater = new Updater();

function fetchSchedulersAndAgents(dispatch) {
    dispatch({type: FETCH_SCHEDULERS.REQUEST});

    return Promise.all([getSchedulers(), getAgents()])
        .then(([{schedulers, schedulerAlerts}, {agents, agentAlerts}]) => {
            dispatch({
                type: FETCH_SCHEDULERS.SUCCESS,
                data: {
                    schedulers,
                    schedulerAlerts,
                    agents,
                    agentAlerts,
                },
            });
        })
        .catch((error) => {
            dispatch({
                type: FETCH_SCHEDULERS.FAILURE,
                data: {
                    message: 'Could not load scheduler and agents.',
                    error,
                },
            });

            const data = error?.response?.data || error;
            const {code, message} = data;

            toaster.add({
                name: 'load/system/schedulersAndAgents',
                autoHiding: false,
                type: 'error',
                content: `[code ${code}] ${message}`,
                title: 'Could not load Schedulers and Agents',
                actions: [{label: ' view', onClick: () => showErrorPopup(error)}],
            });

            if (isRetryFutile(error.code)) {
                dispatch(cancelSchedulersAndAgentsLoading());
            }
        });
}

export function cancelSchedulersAndAgentsLoading() {
    return () => {
        updater.remove(SCHEDULERS_UPDATER_ID);
    };
}

export function loadSchedulersAndAgents() {
    return (dispatch) => {
        updater.add(SCHEDULERS_UPDATER_ID, () => fetchSchedulersAndAgents(dispatch), 30 * 1000);
    };
}
