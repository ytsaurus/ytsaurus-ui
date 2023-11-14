import {Toaster} from '@gravity-ui/uikit';

import {getAgents, getSchedulers} from '../../../store/actions/system/schedulers';
import {FETCH_SCHEDULERS} from '../../../constants/system/schedulers';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';

const toaster = new Toaster();

export function loadSchedulersAndAgents() {
    return (dispatch) => {
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
                    return {isRetryFutile: true};
                }
            });
    };
}
