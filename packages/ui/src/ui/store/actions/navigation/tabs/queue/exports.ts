import {ThunkAction, UnknownAction} from '@reduxjs/toolkit';
import ypath from '../../../../../common/thor/ypath';

import {RootState} from '../../../../reducers';
import {getAttributes} from '../../../../selectors/navigation';

import {ytApiV3} from '../../../../../rum/rum-wrap-api';
import {SET_ORIGINATING_QUEUE_PATH} from '../../../../../constants/navigation';
type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

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
                data: originatingPath[0].output,
            });
        } catch (error: any) {}
    };
}
