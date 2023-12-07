import {SCHEMA_UPDATE_FILTER} from '../../../../../constants/navigation/tabs/schema';

export const initialState = {
    column: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SCHEMA_UPDATE_FILTER:
            return {...state, column: action.data.column};

        default:
            return state;
    }
};
