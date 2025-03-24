import {ThunkAction, UnknownAction} from '@reduxjs/toolkit';
// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import ypath from '../../../../../common/thor/ypath';

import {RootState} from '../../../../reducers';
import {updateView} from '../..';
import {exportsActions} from '../../../../reducers/navigation/tabs/queue/exports';
import {getAttributes, getPath} from '../../../../selectors/navigation';

import {ytApiV3} from '../../../../../rum/rum-wrap-api';
import CancelHelper from '../../../../../utils/cancel-helper';
import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {SET_ORIGINATING_QUEUE_PATH} from '../../../../../constants/navigation';
import {QueueExportConfig} from '../../../../../types/navigation/queue/queue';

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

export function updateExportsConfig(configs: {
    [key: string]: QueueExportConfig<number>;
}): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const attributes = getAttributes(state);
        dispatch(exportsActions.onUpdateConfigRequest());

        try {
            const transactionId = await yt.v3.startTransaction({});
            try {
                await wrapApiPromiseByToaster(
                    ytApiV3.set(
                        {
                            path: `${path}/@static_export_config`,
                            cancellation: cancelHelper.removeAllAndSave,
                            transaction_id: transactionId,
                        },
                        configs,
                    ),
                    {
                        toasterName: 'update_static_export_config',
                        errorTitle: 'Failed to update config',
                        skipSuccessToast: true,
                    },
                );

                for (const config in configs) {
                    if (configs[config]) {
                        await wrapApiPromiseByToaster(
                            ytApiV3.set(
                                {
                                    path: `${configs[config]['export_directory']}/@queue_static_export_destination`,
                                    cancellation: cancelHelper.removeAllAndSave,
                                    transaction_id: transactionId,
                                },
                                {
                                    originating_queue_id: `${ypath.getValue(attributes, '/id')}`,
                                },
                            ),
                            {
                                toasterName: 'update_queue_static_export_destination',
                                errorTitle: 'Failed to update destination map node',
                                skipSuccessToast: true,
                            },
                        );
                    }
                }

                await yt.v3.commitTransaction({transaction_id: transactionId});
                dispatch(exportsActions.onUpdateConfigSuccess());
                dispatch(updateView());
            } catch (error: any) {
                await yt.v3.abortTransaction({transaction_id: transactionId});
                dispatch(exportsActions.onUpdateConfigFailure(error));
            }
        } catch (error: any) {
            dispatch(exportsActions.onUpdateConfigFailure(error));
        }
    };
}

export function fetchOriginatingQueuePath(): AsyncAction {
    return async (dispatch, getState) => {
        const state = getState();
        const attributes = getAttributes(state);
        const queueId = ypath.getValue(
            attributes,
            '/queue_static_export_destination/originating_queue_id',
        );
        try {
            const originatingPath = await ytApiV3.executeBatch({
                parameters: {
                    requests: [
                        {
                            command: 'get' as const,
                            parameters: {
                                path: `#${queueId}/@path`,
                            },
                        },
                    ],
                },
            });
            dispatch({
                type: SET_ORIGINATING_QUEUE_PATH,
                data: originatingPath,
            });
        } catch (error: any) {
            dispatch(exportsActions.onUpdateConfigFailure({error}));
        }
    };
}
