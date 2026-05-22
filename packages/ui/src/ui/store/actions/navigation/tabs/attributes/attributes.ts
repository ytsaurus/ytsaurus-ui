import {type UnknownAction} from 'redux';
import {type ThunkAction} from 'redux-thunk';

import {wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {type RootState} from '../../../../../store/reducers';
import {prepareRequest} from '../../../../../utils/navigation';
import CancelHelper, {isCancelled} from '../../../../../utils/cancel-helper';
import {selectPath, selectTransaction} from '../../../../../store/selectors/navigation';
import {
    type AttributeName,
    attributesActions,
} from '../../../../reducers/navigation/tabs/attributes';
import {YTApiId, ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {TYPED_OUTPUT_FORMAT} from '../../../../../constants';
import i18n from './i18n';

type AsyncAction<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;

const cancelHelper = new CancelHelper();

export function requestAttributes(): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        dispatch(attributesActions.onAttributesRequest());

        const state = getState();
        const path = selectPath(state);
        const transaction = selectTransaction(state);

        const requestParams = {path, transaction};

        try {
            cancelHelper.removeAllRequests();

            const attributesP = ytApiV3Id.get(YTApiId.nodeAttributes, {
                parameters: {
                    ...prepareRequest('/@', requestParams),
                    output_format: TYPED_OUTPUT_FORMAT,
                },
                cancellation: cancelHelper.saveCancelToken,
            });

            const opaqueAttributeKeysP = ytApiV3Id.get(YTApiId.nodeAttributes, {
                parameters: prepareRequest('/@opaque_attribute_keys', requestParams),
                cancellation: cancelHelper.saveCancelToken,
            });

            const [attributes, opaqueAttributeKeys] = await Promise.all([
                attributesP,
                opaqueAttributeKeysP,
            ]);

            dispatch(attributesActions.onAttributesSuccess({attributes, opaqueAttributeKeys}));
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch(attributesActions.onAttributesFailure({error}));
            }
        }
    };
}

export function requestAttribute(name: AttributeName): AsyncAction<Promise<void>> {
    return async (dispatch, getState) => {
        dispatch(attributesActions.onAttributeRequest({name}));

        const state = getState();
        const path = selectPath(state);
        const transaction = selectTransaction(state);

        const requestParams = {path, transaction};

        try {
            const dataP = ytApiV3Id.get(YTApiId.nodeAttributes, {
                parameters: {
                    ...prepareRequest(`/@${name}`, requestParams),
                    output_format: TYPED_OUTPUT_FORMAT,
                },
                cancellation: cancelHelper.saveCancelToken,
            });

            const data = await wrapApiPromiseByToaster(dataP, {
                toasterName: 'load-attribute',
                skipSuccessToast: true,
                errorContent: i18n('alert_failed-to-load-attribute', {name}),
            });

            dispatch(attributesActions.onAttributeSuccess({name, data}));
        } catch (error: any) {
            if (!isCancelled(error)) {
                dispatch(attributesActions.onAttributeFailure({name, error}));
            }
        }
    };
}
