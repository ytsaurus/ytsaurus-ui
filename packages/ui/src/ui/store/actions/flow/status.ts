import {type ThunkAction} from 'redux-thunk';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {type RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import i18n from '../../../pages/flow/i18n';
import {
    selectFlowRequestedAction,
    selectFlowStatusPipelinePath,
} from '../../../store/selectors/flow/status';
import {type FlowStateAction, flowStatusActions} from '../../reducers/flow/status';

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
                    if (!isCancelled(error)) {
                        dispatch(flowStatusActions.onError({error}));
                    }
                },
            );
    };
}

export function updateFlowState({
    pipeline_path,
    state,
}: {
    pipeline_path: string;
    state: FlowStateAction;
}): AsyncAction<Promise<void>> {
    return (dispatch, getState) => {
        const method = `${state}Pipeline` as const;
        const isCurrent = () => selectFlowStatusPipelinePath(getState()) === pipeline_path;
        if (isCurrent()) {
            // The button stays blocked until the pipeline reaches the requested state.
            dispatch(flowStatusActions.setRequestedAction({requestedAction: state}));
        }
        const errorTitles: Record<FlowStateAction, string> = {
            start: i18n('failed-to-start'),
            pause: i18n('failed-to-pause'),
            stop: i18n('failed-to-stop'),
        };
        return wrapApiPromiseByToaster(ytApiV4[method]({pipeline_path}), {
            toasterName: `flow_${state}_pipeline`,
            skipSuccessToast: true,
            errorTitle: errorTitles[state],
        }).then(
            () => {
                if (isCurrent()) {
                    dispatch(loadFlowStatus(pipeline_path));
                }
            },
            () => {
                // The error is already shown by the toaster.
                if (isCurrent() && selectFlowRequestedAction(getState()) === state) {
                    dispatch(flowStatusActions.setRequestedAction({requestedAction: undefined}));
                }
            },
        );
    };
}
