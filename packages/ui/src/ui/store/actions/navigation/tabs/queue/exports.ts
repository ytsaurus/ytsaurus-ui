import {ThunkAction, UnknownAction} from '@reduxjs/toolkit';
import {RootState} from '../../../../reducers';
import {exportsActions} from '../../../../reducers/navigation/tabs/queue/exports';
import {ytApiV3} from '../../../../../rum/rum-wrap-api';
import {getAttributes, getPath} from '../../../../selectors/navigation';
import CancelHelper from '../../../../../utils/cancel-helper';
import {updateView} from '../..';
import ypath from '../../../../../common/thor/ypath';
import { SET_ORIGINATING_QUEUE_PATH } from '../../../../../constants/navigation';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

const cancelHelper = new CancelHelper();

export function requestExportsConfig(): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        dispatch(exportsActions.onGetConfigRequest());
        try {
            const config = await ytApiV3.get({
                parameters: {attributes: ['static_export_config'], path: `${path}/@`},
                cancellation: cancelHelper.removeAllAndSave,
            });
            dispatch(exportsActions.onGetConfigSuccess({config}));
        } catch (error: any) {
            dispatch(exportsActions.onGetConfigFailure({error}));
        }
    };
}

export function updateExportsConfig(config: object): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        dispatch(exportsActions.onUpdateConfigRequest());
        try {
            await ytApiV3.set(
                {
                    path: `${path}/@static_export_config`,
                    cancellation: cancelHelper.removeAllAndSave,
                },
                config,
            );
            dispatch(exportsActions.onUpdateConfigSuccess());
            dispatch(updateView());
        } catch (error: any) {
            dispatch(exportsActions.onUpdateConfigFailure({error}));
        }
    };
}

export function fetchOriginatingQueuePath(): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const attributes = getAttributes(state);
        const queueId = ypath.getValue(attributes, '/queue_static_export_destination/originating_queue_id')
        try {
            const originatingPath = await ytApiV3.get(
                {
                    path: `#${queueId}/@path`,
                    cancellation: cancelHelper.removeAllAndSave,
                }
            );
            dispatch({
                type: SET_ORIGINATING_QUEUE_PATH,
                data: originatingPath,
            })
        } catch (error: any) {
            console.log(error + "ERROR")
            //dispatch(exportsActions.onUpdateConfigFailure({error}));
        }
    };
}
