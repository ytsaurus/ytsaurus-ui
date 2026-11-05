import {type Action} from 'redux';
import {type ActionD} from '../../../types';

import {
    CLOSE_ATTRIBUTES_MODAL,
    LOAD_ATTRIBUTES,
    OPEN_ATTRIBUTES_MODAL,
} from '../../../constants/modals/attributes-modal';

export interface AttributesModalState {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    visible: boolean;
    title: string;
    attributes: unknown;
    errorData: unknown;
}

export type AttributesModalAction =
    | Action<typeof CLOSE_ATTRIBUTES_MODAL | typeof LOAD_ATTRIBUTES.REQUEST>
    | ActionD<typeof OPEN_ATTRIBUTES_MODAL, Pick<AttributesModalState, 'title'>>
    | ActionD<typeof LOAD_ATTRIBUTES.SUCCESS, Pick<AttributesModalState, 'attributes'>>
    | ActionD<typeof LOAD_ATTRIBUTES.FAILURE, {error: unknown}>;

const initialState: AttributesModalState = {
    loading: false,
    loaded: false,
    error: false,
    visible: false,
    title: '',
    attributes: {},
    errorData: undefined,
};

export default (state = initialState, action: AttributesModalAction): AttributesModalState => {
    switch (action.type) {
        case OPEN_ATTRIBUTES_MODAL: {
            const {title} = action.data;

            return {...state, title, visible: true};
        }

        case CLOSE_ATTRIBUTES_MODAL:
            return {...initialState};

        case LOAD_ATTRIBUTES.REQUEST:
            return {...state, loading: true};

        case LOAD_ATTRIBUTES.SUCCESS: {
            const {attributes} = action.data;

            return {...state, attributes, loading: false, loaded: true};
        }

        case LOAD_ATTRIBUTES.FAILURE: {
            const {error} = action.data;

            return {
                ...state,
                errorData: error,
                loading: false,
                loaded: false,
                error: true,
            };
        }

        default:
            return state;
    }
};
