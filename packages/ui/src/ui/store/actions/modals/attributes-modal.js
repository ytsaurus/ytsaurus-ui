import {
    CLOSE_ATTRIBUTES_MODAL,
    LOAD_ATTRIBUTES,
    OPEN_ATTRIBUTES_MODAL,
} from '../../../constants/modals/attributes-modal';
import {TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

export function openModal({title, promise}) {
    return async (dispatch) => {
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
}

export function openAttributesModal({title, path, exactPath, attribute, attributes}) {
    return (dispatch) => {
        if (attributes) {
            dispatch(openModal({title, promise: attributes}));
        } else {
            dispatch(
                openModal({
                    title,
                    promise: ytApiV3Id.get(YTApiId.openAttributesModal, {
                        path: exactPath ? exactPath : `${path}/@${attribute ? attribute : ''}`,
                        output_format: TYPED_OUTPUT_FORMAT,
                    }),
                }),
            );
        }
    };
}

export function closeAttributesModal() {
    return {
        type: CLOSE_ATTRIBUTES_MODAL,
    };
}
