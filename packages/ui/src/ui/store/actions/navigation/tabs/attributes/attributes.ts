import {UnknownAction} from 'redux';
import {ThunkAction} from 'redux-thunk';

import {RootState} from '../../../../../store/reducers';
import {prepareRequest} from '../../../../../utils/navigation';
import CancelHelper, {isCancelled} from '../../../../../utils/cancel-helper';
import {attributesActions} from '../../../../reducers/navigation/tabs/attributes';
import {getPath, getTransaction} from '../../../../../store/selectors/navigation';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {TYPED_OUTPUT_FORMAT} from '../../../../../constants';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

const cancelHelper = new CancelHelper();

export function requestAttributes(): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        dispatch(attributesActions.onRequest());
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        const requestParams = {
            path,
            transaction,
        };

        try {
            const response = await ytApiV3Id.executeBatch(YTApiId.nodeAttributes, {
                parameters: {
                    requests: [
                        {
                            command: 'get',
                            parameters: prepareRequest('/@', {...requestParams}),
                        },
                    ],
                    output_format: TYPED_OUTPUT_FORMAT,
                },
                cancellation: cancelHelper.removeAllAndSave,
            });

            const {output, error} = response[0];
            if (error) {
                throw error;
            }

            dispatch(attributesActions.onSuccess({attributes: output}));
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch(attributesActions.onFailure({error}));
            }
        }
    };
}
