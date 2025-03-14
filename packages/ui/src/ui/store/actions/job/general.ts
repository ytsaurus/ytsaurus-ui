import * as JOB from '../../../constants/job';
import CancelHelper from '../../../utils/cancel-helper';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {getCurrentClusterConfig} from '../../../store/selectors/global';
import {RawJob} from '../../../types/operations/job';
import {RootState} from '../../../store/reducers';
import {ThunkAction} from 'redux-thunk';
import {YTError} from '../../../types';
import {Action} from 'redux';
import {ClusterConfig} from '../../../../shared/yt-types';

const requests = new CancelHelper();

interface LoadJobDataRequestAction {
    type: typeof JOB.LOAD_JOB_DATA_REQUEST;
}

interface LoadJobDataSuccessAction {
    type: typeof JOB.LOAD_JOB_DATA_SUCCESS;
    data: {
        job: RawJob;
        clusterConfig: ClusterConfig;
    };
}

interface LoadJobDataFailureAction {
    type: typeof JOB.LOAD_JOB_DATA_FAILURE;
    data: {
        error: YTError;
    };
}

export type LoadJobDataAction =
    | LoadJobDataRequestAction
    | LoadJobDataSuccessAction
    | LoadJobDataFailureAction;

export function loadJobData(
    operationID: string,
    jobID: string,
): ThunkAction<Promise<void>, RootState, unknown, GeneralActionType> {
    return (dispatch, getState) => {
        dispatch({type: JOB.LOAD_JOB_DATA_REQUEST});

        const clusterConfig = getCurrentClusterConfig(getState());

        return yt.v3
            .getJob({
                parameters: {
                    operation_id: operationID,
                    job_id: jobID,
                },
                cancellation: requests.saveCancelToken,
            })
            .then((job: RawJob) => {
                dispatch({
                    type: JOB.LOAD_JOB_DATA_SUCCESS,
                    data: {job, clusterConfig},
                });
            })
            .catch((error: YTError) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: JOB.LOAD_JOB_DATA_CANCELLED});
                } else {
                    dispatch({
                        type: JOB.LOAD_JOB_DATA_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

interface AbortAndResetAction {
    type: typeof JOB.LOAD_JOB_DATA_CANCELLED;
}

export function abortAndReset(): ThunkAction<void, RootState, unknown, Action<string>> {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: JOB.LOAD_JOB_DATA_CANCELLED});
    };
}

export type GeneralActionType = LoadJobDataAction | AbortAndResetAction;
