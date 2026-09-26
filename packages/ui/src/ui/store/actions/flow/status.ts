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
import {type FlowStateAction, type FlowStatus, flowStatusActions} from '../../reducers/flow/status';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function loadFlowStatus(pipeline_path: string): AsyncAction<Promise<void>> {
    return (dispatch) => {
        dispatch(flowStatusActions.onRequest({pipeline_path}));

        cancelHelper.removeAllRequests();
        const targetState = ytApiV4
            .getPipelineDynamicSpec({
                parameters: {pipeline_path, spec_path: '/target_state'},
                cancellation: cancelHelper.saveCancelToken,
            })
            .then(
                (data: {spec?: string}) => parseFlowStatus(data?.spec),
                (error: unknown) => {
                    if (isCancelled(error)) {
                        throw error;
                    }
                    // The buttons fall back to the states reported by the controller.
                    return undefined;
                },
            );
        const state = ytApiV4.getPipelineState({
            parameters: {pipeline_path},
            cancellation: cancelHelper.saveCancelToken,
        });

        return Promise.all([state, targetState]).then(
            ([data, target]) => {
                dispatch(flowStatusActions.onSuccess({data, targetState: target}));
            },
            (error) => {
                if (!isCancelled(error)) {
                    dispatch(flowStatusActions.onError({error}));
                }
            },
        );
    };
}

const FLOW_STATUSES: Array<FlowStatus> = [
    'Unknown',
    'Stopped',
    'Paused',
    'Working',
    'Draining',
    'Pausing',
    'Completed',
];

// The dynamic spec keeps enums in snake case, get_pipeline_state reports them in camel case.
function parseFlowStatus(value?: string): FlowStatus | undefined {
    const status = value ? value.charAt(0).toUpperCase() + value.slice(1) : undefined;
    return FLOW_STATUSES.find((item) => item === status);
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
        return wrapApiPromiseByToaster(ytApiV4[method]({pipeline_path}), {
            toasterName: `flow_${state}_pipeline`,
            skipSuccessToast: true,
            errorTitle: i18n(`failed-to-${state}`),
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
