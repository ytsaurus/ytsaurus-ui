// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {Action} from 'redux';
import {YTError} from '../../../types';
import ypath from '../../../common/thor/ypath';
import * as JOB from '../../../constants/job';
import CancelHelper from '../../../utils/cancel-helper';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../../store/reducers';
import {JobSpecification} from '../../../types/job';

interface JobSpecRequest {
    type: number;
    version: number;
    scheduler_job_spec_ext: JobSpecification;
}

interface LoadJobSpecificationRequestAction {
    type: typeof JOB.LOAD_JOB_SPECIFICATION_REQUEST;
}

interface LoadJobSpecificationSuccessAction {
    type: typeof JOB.LOAD_JOB_SPECIFICATION_SUCCESS;
    data: {
        specification: JobSpecification;
    };
}

interface LoadJobSpecificationFailureAction {
    type: typeof JOB.LOAD_JOB_SPECIFICATION_FAILURE;
    data: {
        error: YTError;
    };
}

type LoadJobSpecificationAction =
    | LoadJobSpecificationRequestAction
    | LoadJobSpecificationSuccessAction
    | LoadJobSpecificationFailureAction;

interface AbortAndResetAction {
    type: typeof JOB.LOAD_JOB_SPECIFICATION_CANCELLED;
}

interface ChangeOmitNodeDirectoryAction {
    type: typeof JOB.CHANGE_OMIT_NODE_DIRECTORY;
}

interface ChangeOmitInputTableSpecsAction {
    type: typeof JOB.CHANGE_OMIT_INPUT_TABLES_SPECS;
}

interface ChangeOmitOutputTableSpecsAction {
    type: typeof JOB.CHANGE_OMIT_OUTPUT_TABLES_SPECS;
}

type CheckboxAction =
    | ChangeOmitNodeDirectoryAction
    | ChangeOmitInputTableSpecsAction
    | ChangeOmitOutputTableSpecsAction;

export type SpecificationActionType =
    | LoadJobSpecificationAction
    | AbortAndResetAction
    | CheckboxAction;

const requests = new CancelHelper();

export function loadJobSpecification(
    jobID: string,
): ThunkAction<Promise<void>, RootState, unknown, Action<string>> {
    return (dispatch, getState) => {
        const {omitNodeDirectory, omitInputTableSpecs, omitOutputTableSpecs} =
            getState().job.specification;

        dispatch({type: JOB.LOAD_JOB_SPECIFICATION_REQUEST});

        return yt.v4
            .getJobSpec(
                {
                    job_id: jobID,
                    omit_node_directory: omitNodeDirectory,
                    omit_input_table_specs: omitInputTableSpecs,
                    omit_output_table_specs: omitOutputTableSpecs,
                },
                requests.saveCancelToken,
            )
            .then((req: JobSpecRequest) => {
                // @ts-ignore
                const [scheduler_job_spec_ext, job_spec_ext]: JobSpecification = ypath.getValues(
                    req,
                    ['/scheduler_job_spec_ext', '/job_spec_ext'],
                );

                dispatch({
                    type: JOB.LOAD_JOB_SPECIFICATION_SUCCESS,
                    data: {specification: job_spec_ext ?? scheduler_job_spec_ext},
                });
            })
            .catch((error: YTError) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: JOB.LOAD_JOB_SPECIFICATION_CANCELLED});
                } else {
                    dispatch({
                        type: JOB.LOAD_JOB_SPECIFICATION_FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function abortAndReset(): ThunkAction<void, RootState, unknown, Action<string>> {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: JOB.LOAD_JOB_SPECIFICATION_CANCELLED});
    };
}

export function changeOmitNodeDirectory(
    jobID: string,
): ThunkAction<void, RootState, unknown, Action<string>> {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: JOB.CHANGE_OMIT_NODE_DIRECTORY});
        dispatch(loadJobSpecification(jobID));
    };
}

export function changeOmitInputTableSpecs(
    jobID: string,
): ThunkAction<void, RootState, unknown, Action<string>> {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: JOB.CHANGE_OMIT_INPUT_TABLES_SPECS});
        dispatch(loadJobSpecification(jobID));
    };
}

export function changeOmitOutputTableSpecs(
    jobID: string,
): ThunkAction<void, RootState, unknown, Action<string>> {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: JOB.CHANGE_OMIT_OUTPUT_TABLES_SPECS});
        dispatch(loadJobSpecification(jobID));
    };
}
