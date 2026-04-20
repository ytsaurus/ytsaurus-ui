import * as JOB from '../../../constants/job';
import CancelHelper from '../../../utils/cancel-helper';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {selectCurrentClusterConfig} from '../../../store/selectors/global';
import {type RawJob} from '../../../types/operations/job';
import {type RootState} from '../../../store/reducers';
import {type ThunkAction} from 'redux-thunk';
import {type YTError} from '../../../types';
import {type Action} from 'redux';
import {type ClusterConfig} from '../../../../shared/yt-types';

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

        const clusterConfig = selectCurrentClusterConfig(getState());

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
