import {ThunkAction} from 'redux-thunk';
import {UnknownAction} from '@reduxjs/toolkit';

import CancelHelper, {isCancelled} from '../../../../utils/cancel-helper';
import {prepareRequest} from '../../../../utils/navigation';
import {getPath, getTransaction} from '../../../selectors/navigation';
import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {RootState} from '../../../../store/reducers';
import {userAttributesActions} from '../../../../store/reducers/navigation/tabs/user-attributes';
import {TYPED_OUTPUT_FORMAT} from '../../../../constants';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

const requests = new CancelHelper();

export function requestUserAttributes(): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        const state = getState();
        const path = getPath(state);
        const transaction = getTransaction(state);

        dispatch(userAttributesActions.onRequest());
        requests.removeAllRequests();

        return ytApiV3Id
            .get(YTApiId.navigationUserAttributes, {
                parameters: prepareRequest('/@user_attributes', {
                    path,
                    transaction,
                }),
                output_format: TYPED_OUTPUT_FORMAT,
                cancellation: requests.saveCancelToken,
            })
            .then((attributes) => {
                dispatch(userAttributesActions.onSuccess({attributes}));
            })
            .catch((error) => {
                if (!isCancelled(error)) {
                    dispatch(userAttributesActions.onFailure({error}));
                }
            });
    };
}

export function abortAndReset(): AsyncAction<Promise<void>> {
    return async (_dispatch) => {
        requests.removeAllRequests();
    };
}
