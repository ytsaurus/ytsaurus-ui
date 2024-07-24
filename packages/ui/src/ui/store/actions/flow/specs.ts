import {ThunkAction} from 'redux-thunk';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import CancelHelper from '../../../utils/cancel-helper';
import {FlowSpecState, staticSpecActions} from '../../../store/reducers/flow/specs';
import {getFlowStaticSpecPath} from '../../../store/selectors/flow/specs';

const cancelHelper = new CancelHelper();

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

export function loadFlowStaticSpec(pipeline_path: string): AsyncAction {
    return (dispatch) => {
        staticSpecActions.onRequest({pipeline_path});
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
                    dispatch(staticSpecActions.onError({error}));
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
    return (dispatch) => {
        return ytApiV4
            .setPipelineSpec({pipeline_path: path, expected_version: data?.version}, data?.spec)
            .then(() => {
                dispatch(refreshStaticSpec(path));
            });
    };
}

function refreshStaticSpec(path: string): AsyncAction {
    return (dispatch, getState) => {
        const pipeline_path = getFlowStaticSpecPath(getState());
        if (pipeline_path && pipeline_path === path) {
            dispatch(loadFlowStaticSpec(path));
        }
    };
}
