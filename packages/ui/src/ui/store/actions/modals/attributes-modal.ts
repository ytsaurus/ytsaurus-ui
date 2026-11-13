import {
    CLOSE_ATTRIBUTES_MODAL,
    LOAD_ATTRIBUTES,
    OPEN_ATTRIBUTES_MODAL,
} from '../../../constants/modals/attributes-modal';
import {TYPED_OUTPUT_FORMAT} from '../../../constants';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {type ThunkAction} from 'redux-thunk';
import {type RootState} from '../../reducers';
import {type AttributesModalAction} from '../../reducers/modals/attributes-modal';

type ModalThunkAction = ThunkAction<void, RootState, null, AttributesModalAction>;

export const openModal =
    ({title, promise}: {title: string; promise: Promise<unknown>}): ModalThunkAction =>
    async (dispatch) => {
        dispatch({
            type: OPEN_ATTRIBUTES_MODAL,
            data: {title},
        });

        dispatch({type: LOAD_ATTRIBUTES.REQUEST});

        await promise
            .then((attributes) => {
                dispatch({
                    type: LOAD_ATTRIBUTES.SUCCESS,
                    data: {attributes},
                });
            })
            .catch((error: unknown) => {
                dispatch({
                    type: LOAD_ATTRIBUTES.FAILURE,
                    data: {error},
                });
            });
    };

export type OpenAttributesModalParams = {
    title: string;
    attribute?: string;
} & (
    | {attributes: object; path?: string; exactPath?: string}
    | {attributes?: undefined; path: string; exactPath?: string}
    | {attributes?: undefined; path?: string; exactPath: string}
);

export const openAttributesModal =
    ({
        title,
        path,
        exactPath,
        attribute,
        attributes,
    }: OpenAttributesModalParams): ModalThunkAction =>
    (dispatch) => {
        if (attributes) {
            dispatch(openModal({title, promise: Promise.resolve(attributes)}));
            return;
        }

        if (!path && !exactPath) {
            dispatch({
                type: LOAD_ATTRIBUTES.FAILURE,
                data: {error: new Error(`Path is not defined, nothing to load`)},
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

export function closeAttributesModal(): AttributesModalAction {
    return {
        type: CLOSE_ATTRIBUTES_MODAL,
    };
}
