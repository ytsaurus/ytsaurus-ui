import {ThunkAction} from 'redux-thunk';

import {ytApiV4} from '../../../rum/rum-wrap-api';
import {RootState} from '../../../store/reducers';
import CancelHelper, {isCancelled} from '../../../utils/cancel-helper';
import {flowLayoutActions} from '../../../store/reducers/flow/layout';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, any>;

const cancelHelper = new CancelHelper();

export function loadFlowLayout(pipeline_path: string): AsyncAction<Promise<void>> {
    return (dispatch) => {
        dispatch(flowLayoutActions.onRequest({pipeline_path}));

        return ytApiV4
            .getFlowView({
                parameters: {pipeline_path, ...{annotate_with_types: true}},
                cancellation: cancelHelper.removeAllAndSave,
            })
            .then(
                (data) => {
                    dispatch(flowLayoutActions.onSuccess({data}));
                },
                (error) => {
                    if (!isCancelled(error)) {
                        dispatch(flowLayoutActions.onError({error}));
                    }
                },
            );
    };
}

export function expandFlowLayoutComputation({
    computation_id,
}: {
    computation_id: string;
}): AsyncAction<void> {
    return (dispatch) => {
        dispatch(flowLayoutActions.onExpandComputation({computation_id}));
    };
}
