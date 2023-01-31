import {UPDATE_FILTER} from '../../../../../constants/navigation/tabs/schema';

export const initialState = {
    column: '',
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_FILTER:
            return {...state, column: action.data.column};

        default:
            return state;
    }
};
