import {TABLE_ERASE_MODAL_PARTIAL} from '../../../../constants/navigation/modals/table-erase-modal';
import {ActionD} from '../../../../types';

export interface State {
    visible: boolean;
    path?: string;
}

const initialState: State = {
    visible: false,
};

export default function reducer(state = initialState, action: Action) {
    switch (action.type) {
        case TABLE_ERASE_MODAL_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

type Action = ActionD<typeof TABLE_ERASE_MODAL_PARTIAL, Partial<State>>;
