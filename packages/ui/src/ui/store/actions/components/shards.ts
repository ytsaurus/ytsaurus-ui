// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import CancelHelper from '../../../utils/cancel-helper';
import {
    CLOSE_SHARD_NAME_EDITOR,
    GET_SHARDS,
    OPEN_SHARD_NAME_EDITOR,
    SET_SHARD_NAME,
} from '../../../constants/components/shards';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import type {AppThunkDispatch} from '../../../store/thunkDispatch';

const requests = new CancelHelper();

export function getShards() {
    return (dispatch: AppThunkDispatch) => {
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

export function setShardName(id: string, name: string) {
    return (dispatch: AppThunkDispatch) => {
        dispatch({type: SET_SHARD_NAME.REQUEST});

        return yt.v3
            .set({path: `//sys/cypress_shards/${id}/@name`}, name)
            .then(() => {
                dispatch({type: SET_SHARD_NAME.SUCCESS});
                dispatch(getShards());
                dispatch(closeNameEditor());
            })
            .catch((error: unknown) => {
                dispatch({
                    type: SET_SHARD_NAME.FAILURE,
                    data: {error},
                });
            });
    };
}

export function openNameEditor(id: string) {
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
    return (dispatch: AppThunkDispatch) => {
        requests.removeAllRequests();
        dispatch({type: GET_SHARDS.CANCELLED});
    };
}
