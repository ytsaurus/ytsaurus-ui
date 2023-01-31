import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {DECOMMISSION_PARTIAL} from '../../../constants/components/main';
import {ActionD} from '../../../types';

export interface DecommissionState {
    host: string;
    message: string;
}

const initialState: DecommissionState = {
    host: '',
    message: '',
};

function reducer(state = initialState, action: DecommissionAction) {
    switch (action.type) {
        case DECOMMISSION_PARTIAL:
            return {...state, ...action.data};
    }
    return state;
}

export type DecommissionAction = ActionD<typeof DECOMMISSION_PARTIAL, Partial<DecommissionState>>;

export default mergeStateOnClusterChange(initialState, {}, reducer);
