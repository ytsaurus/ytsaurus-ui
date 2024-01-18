import {ThunkAction} from 'redux-thunk';

import {RootState} from '../../../reducers';
import {NodeUnrecognizedOptionsAction} from '../../../reducers/components/node/unrecognized-options';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {NODE_UNRECOGNIEZED_OPTIONS} from '../../../../constants/components/nodes/node';
import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';

const cancelHeler = new CancelHelper();

export function loadNodeUnrecognizedOptions(
    host: string,
): ThunkAction<any, RootState, unknown, NodeUnrecognizedOptionsAction> {
    return (dispatch) => {
        dispatch({type: NODE_UNRECOGNIEZED_OPTIONS.REQUEST, data: {host}});

        return ytApiV3Id
            .get(YTApiId.nodeUnrecognizedOptions, {
                parameters: {
                    path: `//sys/cluster_nodes/${host}/orchid/dynamic_config_manager/unrecognized_options`,
                },
                cancellation: cancelHeler.removeAllAndSave,
            })
            .then((data) => {
                dispatch({type: NODE_UNRECOGNIEZED_OPTIONS.SUCCESS, data: {data}});
            })
            .catch((error: any) => {
                if (!isCancelled(error)) {
                    dispatch({type: NODE_UNRECOGNIEZED_OPTIONS.FAILURE, data: {error}});
                }
            });
    };
}
