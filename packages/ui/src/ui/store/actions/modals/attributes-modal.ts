import {
    CLOSE_ATTRIBUTES_MODAL,
    LOAD_ATTRIBUTES,
    OPEN_ATTRIBUTES_MODAL,
} from '../../../constants/modals/attributes-modal';
import {TYPED_OUTPUT_FORMAT} from '../../../constants';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../../reducers';
import {Action} from 'redux';
import {ReactNode} from 'react';

type ModalThunkAction = ThunkAction<void, RootState, null, Action>;

export const openModal =
    ({title, promise}: {title: ReactNode; promise: Promise<unknown>}): ModalThunkAction =>
    async (dispatch) => {
        dispatch({
            type: OPEN_ATTRIBUTES_MODAL,
            data: {title},
        });

        dispatch({type: LOAD_ATTRIBUTES.REQUEST});

        try {
            const attributes = await promise;
            dispatch({
                type: LOAD_ATTRIBUTES.SUCCESS,
                data: {attributes},
            });
        } catch (error) {
            dispatch({
                type: LOAD_ATTRIBUTES.FAILURE,
                data: {error},
            });
        }
    };

export const openAttributesModal =
    ({
        title,
        path,
        exactPath,
        attribute,
        attributes,
    }: {
        title: ReactNode;
        path?: string;
        exactPath?: string;
        attribute?: string;
        attributes?: object;
    }): ModalThunkAction =>
    (dispatch) => {
        if (attributes) {
            dispatch(openModal({title, promise: Promise.resolve(attributes)}));
            return;
        }

        if (!path && !exactPath) {
            dispatch({
                type: LOAD_ATTRIBUTES.FAILURE,
                data: new Error(`Path is not defined, nothing to load`),
            });
            return;
        }

        dispatch(
            openModal({
                title,
                promise: ytApiV3Id.get(YTApiId.openAttributesModal, {
                    path: exactPath ? exactPath : `${path}/@${attribute ? attribute : ''}`,
                    output_format: TYPED_OUTPUT_FORMAT,
                }),
            }),
        );
    };

export function closeAttributesModal() {
    return {
        type: CLOSE_ATTRIBUTES_MODAL,
    };
}
