import {Toaster} from '@gravity-ui/uikit';
import {ThunkAction} from 'redux-thunk';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {CompetitiveJobs, RawJob} from '../../../types/job';
import {RootState} from '../../../store/reducers';
import CancelHelper from '../../../utils/cancel-helper';
import * as JOB from '../../../constants/job';
import {YTError} from '../../../types';
import {Action} from 'redux';

const requests = new CancelHelper();
const toaster = new Toaster();

interface LoadJobCompetitionRequestAction {
    type: typeof JOB.LOAD_JOB_COMPETITORS_REQUEST;
}

interface LoadJobCompetitionSuccessAction {
    type: typeof JOB.LOAD_JOB_COMPETITORS_SUCCESS;
    data: {
        competitors: RawJob[];
    };
}

interface LoadJobCompetitionFailureAction {
    type: typeof JOB.LOAD_JOB_COMPETITORS_FAILURE;
    data: {
        error?: YTError;
    };
}

export type LoadCompetitorsAction =
    | LoadJobCompetitionRequestAction
    | LoadJobCompetitionSuccessAction
    | LoadJobCompetitionFailureAction;

export function loadCompetitors(
    operationID: string,
    jobCompetitionID: string,
): ThunkAction<Promise<void>, RootState, unknown, Action<string>> {
    return (dispatch) => {
        dispatch({type: JOB.LOAD_JOB_COMPETITORS_REQUEST});

        return yt.v3
            .listJobs({
                parameters: {
                    operation_id: operationID,
                    job_competition_id: jobCompetitionID,
                },
                cancellation: requests.saveCancelToken,
            })
            .then((competitors: CompetitiveJobs) => {
                dispatch({
                    type: JOB.LOAD_JOB_COMPETITORS_SUCCESS,
                    data: {competitors: competitors.jobs},
                });
            })
            .catch((error: YTError) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: JOB.LOAD_JOB_COMPETITORS_CANCELLED});
                } else {
                    toaster.add({
                        type: 'error',
                        name: 'job competitors',
                        autoHiding: 10000,
                        content: error?.message || 'Oops, something went wrong',
                        title: "Failed to load job's competitors",
                    });

                    dispatch({
                        type: JOB.LOAD_JOB_COMPETITORS_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

interface AbortAndResetAction {
    type: typeof JOB.LOAD_JOB_COMPETITORS_CANCELLED;
}

export function abortAndReset(): ThunkAction<void, RootState, unknown, Action<string>> {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: JOB.LOAD_JOB_COMPETITORS_CANCELLED});
    };
}

export type CompetitorsActionType = LoadCompetitorsAction | AbortAndResetAction;
