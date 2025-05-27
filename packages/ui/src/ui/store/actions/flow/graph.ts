import {ThunkAction} from 'redux-thunk';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {flowGraphSlice} from '../../../store/reducers/flow/graph';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function loadFlowGraph(pipeline_path: string): AsyncAction<Promise<void>> {
    return (dispatch) => {
        dispatch(flowGraphSlice.actions.onRequest({pipeline_path}));

        return ytApiV4
            .flowExecute({
                parameters: {flow_command: 'describe-pipeline', pipeline_path},
                cancellation: cancelHelper.removeAllAndSave,
                data: {},
            })
            .then(
                (data) => {
                    dispatch(flowGraphSlice.actions.onSuccess({data}));
                },
                (error) => {
                    if (!isCancelled(error)) {
                        dispatch(flowGraphSlice.actions.onError({error}));
                    }
                },
            );
    };
}
