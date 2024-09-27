// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {TABLE_MOUNT_CONFIG} from '../../../../../constants/navigation/content/table';
import {ThunkAction} from 'redux-thunk';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {RootState} from '../../../../../store/reducers';
import {TableMountConfigAction} from '../../../../../store/reducers/navigation/content/table/table-mount-config';
import {isCancelled} from '../../../../../utils/cancel-helper';

type TableMountConfigThunkAction = ThunkAction<unknown, RootState, unknown, TableMountConfigAction>;

export function fetchTableMountConfig(path: string): TableMountConfigThunkAction {
    return (dispatch) => {
        dispatch({type: TABLE_MOUNT_CONFIG.REQUEST});

        return ytApiV3Id
            .executeBatch(YTApiId.navigationTableMountConfig, {
                requests: [{command: 'get', parameters: {path: `${path}/@mount_config`}}],
            })
            .then(([{output, error}]) => {
                if (error && error?.code !== yt.codes.NODE_DOES_NOT_EXIST) {
                    dispatch({type: TABLE_MOUNT_CONFIG.FAILURE, data: {error}});
                    return;
                }

                dispatch({
                    type: TABLE_MOUNT_CONFIG.SUCCESS,
                    data: {data: output},
                });
            })
            .catch((error: any) => {
                if (isCancelled(error)) {
                    dispatch({type: TABLE_MOUNT_CONFIG.CANCELLED});
                } else {
                    dispatch({type: TABLE_MOUNT_CONFIG.FAILURE, data: {error}});
                }
            });
    };
}
