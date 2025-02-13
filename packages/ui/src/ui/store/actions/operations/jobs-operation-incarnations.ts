import {ThunkAction} from 'redux-thunk';
import compact_ from 'lodash/compact';
import uniq_ from 'lodash/uniq';

import {RootState} from '../../../store/reducers';
import {jobOperaionIncarnationActions} from '../../../store/reducers/operations/jobs/jobs-operation-incarnations';
import CancelHelper from '../../../utils/cancel-helper';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {ListJobsResponse} from '../../../../shared/yt-types';
import {getJobs} from './jobs';

type OperationIncarnationThunkAction<T = void> = ThunkAction<T, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function fetchOperationIncarnationAvailableItems(operation: {
    id: string;
    type: string;
}): OperationIncarnationThunkAction {
    return (dispatch) => {
        cancelHelper.removeAllRequests();
        dispatch(jobOperaionIncarnationActions.onRequest({operationId: operation.id}));

        if (operation.type !== 'vanilla') {
            return dispatch(jobOperaionIncarnationActions.onReset());
        }

        return ytApiV3Id
            .listJobs(YTApiId.jobsOperationIncarnations, {
                parameters: {
                    operation_id: operation.id,
                    /**
                     * It is supposed that vanilla operations don't have much jobs
                     * and `limit: 1000` allows to load all jobs
                     */
                    limit: 1000,
                },
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then((data: ListJobsResponse) => {
                dispatch(
                    jobOperaionIncarnationActions.onSuccess({
                        availableValues: uniq_(
                            compact_(data.jobs.map((item) => item.operation_incarnation)),
                        ),
                    }),
                );
            });
    };
}

export function updateJobsOperationIncarnationFilter(
    filter: string | undefined,
): OperationIncarnationThunkAction {
    return (dispatch) => {
        dispatch(jobOperaionIncarnationActions.setFilter({filter}));
        dispatch(getJobs());
    };
}
