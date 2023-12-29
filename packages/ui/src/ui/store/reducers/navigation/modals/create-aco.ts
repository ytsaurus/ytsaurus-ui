import {CREATE_ACO_MODAL} from '../../../../constants/navigation/modals/index';
import {ActionD} from '../../../../types';

export interface CreateACOState {
    visible: boolean;
    path?: string;
    namespace?: string;
}

const initialState: CreateACOState = {
    visible: false,
};

export default function reducer(state = initialState, action: CreateACOModalAction) {
    switch (action.type) {
        case CREATE_ACO_MODAL:
            return {...state, ...action.data};
    }

    return state;
}

export type CreateACOModalAction = ActionD<typeof CREATE_ACO_MODAL, Partial<CreateACOState>>;
