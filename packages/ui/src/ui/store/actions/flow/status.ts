import {ThunkAction} from 'redux-thunk';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import CancelHelper from '../../../utils/cancel-helper';
import {getFlowStatusPipelinePath} from '../../../store/selectors/flow/status';
import {flowStatusActions} from '../../reducers/flow/status';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function loadFlowStatus(pipeline_path: string): AsyncAction<Promise<void>> {
    return (dispatch) => {
        dispatch(flowStatusActions.onRequest({pipeline_path}));

        return ytApiV4
            .getPipelineState({
                parameters: {pipeline_path},
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(
                (data) => {
                    dispatch(flowStatusActions.onSuccess({data}));
                },
                (error) => {
                    dispatch(flowStatusActions.onError({error}));
                },
            );
    };
}

export function updateFlowState({
    pipeline_path,
    state,
}: {
    pipeline_path: string;
    state: 'start' | 'stop' | 'pause';
}): AsyncAction<Promise<void>> {
    return (dispatch, getState) => {
        const method = `${state}Pipeline` as const;
        return ytApiV4[method]({pipeline_path}).then(() => {
            const path = getFlowStatusPipelinePath(getState());
            if (path === pipeline_path) {
                dispatch(loadFlowStatus(pipeline_path));
            }
        });
    };
}
