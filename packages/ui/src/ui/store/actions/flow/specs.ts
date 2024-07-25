import {ThunkAction} from 'redux-thunk';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {
    FlowSpecState,
    dynamicSpecActions,
    staticSpecActions,
} from '../../../store/reducers/flow/specs';
import {getFlowDynamicSpecPath, getFlowStaticSpecPath} from '../../../store/selectors/flow/specs';

const cancelHelper = new CancelHelper();

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

export function loadFlowStaticSpec(pipeline_path: string): AsyncAction {
    return (dispatch) => {
        dispatch(staticSpecActions.onRequest({pipeline_path}));
        return ytApiV4
            .getPipelineSpec({
                parameters: {pipeline_path},
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(
                (data: FlowSpecState['data']) => {
                    dispatch(staticSpecActions.onSuccess({data}));
                },
                (error: any) => {
                    if (!isCancelled(error)) {
                        dispatch(staticSpecActions.onError({error}));
                    }
                },
            );
    };
}

export function updateFlowStaticSpec({
    data,
    path,
}: {
    data: FlowSpecState['data'];
    path: string;
}): AsyncAction<Promise<void>> {
    return (dispatch, getState) => {
        return ytApiV4
            .setPipelineSpec({pipeline_path: path, expected_version: data?.version}, data?.spec)
            .then(() => {
                const pipeline_path = getFlowStaticSpecPath(getState());
                if (pipeline_path && pipeline_path === path) {
                    dispatch(loadFlowStaticSpec(path));
                }
            });
    };
}

export function loadFlowDynamicSpec(pipeline_path: string): AsyncAction {
    return (dispatch) => {
        dispatch(dynamicSpecActions.onRequest({pipeline_path}));
        return ytApiV4
            .getPipelineDynamicSpec({
                parameters: {pipeline_path},
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(
                (data: FlowSpecState['data']) => {
                    dispatch(dynamicSpecActions.onSuccess({data}));
                },
                (error: any) => {
                    if (!isCancelled(error)) {
                        dispatch(dynamicSpecActions.onError({error}));
                    }
                },
            );
    };
}

export function updateFlowDynamicSpec({
    data,
    path,
}: {
    data: FlowSpecState['data'];
    path: string;
}): AsyncAction<Promise<void>> {
    return (dispatch, getState) => {
        return ytApiV4
            .setPipelineDynamicSpec(
                {pipeline_path: path, expected_version: data?.version},
                data?.spec,
            )
            .then(() => {
                const pipline_path = getFlowDynamicSpecPath(getState());
                if (path === pipline_path) {
                    dispatch(loadFlowDynamicSpec(path));
                }
            });
    };
}
