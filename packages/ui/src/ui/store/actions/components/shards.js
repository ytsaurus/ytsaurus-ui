import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import CancelHelper from '../../../utils/cancel-helper';
import {
    GET_SHARDS,
    SET_SHARD_NAME,
    OPEN_SHARD_NAME_EDITOR,
    CLOSE_SHARD_NAME_EDITOR,
} from '../../../constants/components/shards';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

const requests = new CancelHelper();

export function getShards() {
    return (dispatch) => {
        dispatch({type: GET_SHARDS.REQUEST});

        requests.removeAllRequests();
        return ytApiV3Id
            .list(YTApiId.componentsShards, {
                parameters: {
                    path: '//sys/cypress_shards',
                    attributes: ['id', 'name', 'total_account_statistics'],
                },
                cancellation: requests.saveCancelToken,
            })
            .then((shards) => {
                dispatch({
                    type: GET_SHARDS.SUCCESS,
                    data: {shards},
                });
            })
            .catch((error) => {
                if (error.code === yt.codes.CANCELLED) {
                    dispatch({type: GET_SHARDS.CANCELLED});
                } else {
                    dispatch({
                        type: GET_SHARDS.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function setShardName(id, name) {
    return (dispatch) => {
        dispatch({type: SET_SHARD_NAME.REQUEST});

        return yt.v3
            .set({path: `//sys/cypress_shards/${id}/@name`}, name)
            .then(() => {
                dispatch({type: SET_SHARD_NAME.SUCCESS});
                dispatch(getShards());
                dispatch(closeNameEditor());
            })
            .catch((error) => {
                dispatch({
                    type: SET_SHARD_NAME.FAILURE,
                    data: {error},
                });
            });
    };
}

export function openNameEditor(id) {
    return {
        type: OPEN_SHARD_NAME_EDITOR,
        data: {id},
    };
}

export function closeNameEditor() {
    return {
        type: CLOSE_SHARD_NAME_EDITOR,
    };
}

export function abortAllRequests() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_SHARDS.CANCELLED});
    };
}
