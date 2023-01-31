import {GET_USER_ATTRIBUTE_KEYS} from '../../../../constants/navigation/tabs/user-attributes';

export const initialState = {
    loading: false,
    loaded: false,
    error: false,
    errorData: {},
    userAttributeKeys: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_USER_ATTRIBUTE_KEYS.REQUEST:
            return {...state, loading: true};

        case GET_USER_ATTRIBUTE_KEYS.SUCCESS: {
            const {userAttributeKeys} = action.data;

            return {
                ...state,
                userAttributeKeys,
                loaded: true,
                loading: false,
                error: false,
            };
        }

        case GET_USER_ATTRIBUTE_KEYS.FAILURE:
            return {
                ...state,
                loading: false,
                error: true,
                errorData: action.data.error,
            };

        case GET_USER_ATTRIBUTE_KEYS.CANCELLED:
            return {...initialState};

        default:
            return state;
    }
};
