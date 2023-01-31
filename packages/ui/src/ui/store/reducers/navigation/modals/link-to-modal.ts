import {LINK_TO_MODAL_PARTIAL} from '../../../../constants/navigation/modals/index';
import {ActionD} from '../../../../types';

export interface LinkToState {
    visible: boolean;

    path?: string;
    target?: string;
}

const initialState: LinkToState = {
    visible: false,
};

export default function reducer(state = initialState, action: LinkToModalAction) {
    switch (action.type) {
        case LINK_TO_MODAL_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type LinkToModalAction = ActionD<typeof LINK_TO_MODAL_PARTIAL, Partial<LinkToState>>;
