import {
    CHANGE_ROLE,
    CLOSE_CHANGE_ROLE_MODAL,
    OPEN_CHANGE_ROLE_MODAL,
} from '../../../../../constants/components/proxies/actions/change-role';

const initialState = {
    host: '',
    visible: false,
    loading: false,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case OPEN_CHANGE_ROLE_MODAL:
            return {...state, host: action.data.host, visible: true};

        case CLOSE_CHANGE_ROLE_MODAL:
            return {...state, visible: false};

        case CHANGE_ROLE.REQUEST:
            return {...state, loading: true};

        case CHANGE_ROLE.SUCCESS:
            return {...state, loading: false};

        case CHANGE_ROLE.FAILURE:
            return {...state, loading: false};

        default:
            return state;
    }
};
