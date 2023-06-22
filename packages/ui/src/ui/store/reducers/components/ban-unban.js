import {mergeStateOnClusterChange} from '../../../store/reducers/utils';
import {
    BAN_ITEM,
    CLOSE_BAN_MODAL,
    CLOSE_UNBAN_MODAL,
    OPEN_BAN_MODAL,
    OPEN_UNBAN_MODAL,
    UNBAN_ITEM,
} from '../../../constants/components/ban-unban';

const initialState = {
    host: '',

    banVisible: false,
    banning: false,

    unbanVisible: false,
    unbanning: false,
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        // ban
        case OPEN_BAN_MODAL:
            return {...state, banVisible: true, host: action.data.host};

        case BAN_ITEM.REQUEST:
            return {...state, banning: true};

        case BAN_ITEM.SUCCESS:
            return {...state, banning: false};

        case BAN_ITEM.FAILURE:
            return {...state, banning: false};

        case CLOSE_BAN_MODAL:
            return {
                ...state,
                banVisible: false,
                banning: false,
                host: initialState.host,
            };

        // unban
        case OPEN_UNBAN_MODAL:
            return {...state, unbanVisible: true, host: action.data.host};

        case UNBAN_ITEM.REQUEST:
            return {...state, unbanning: true};

        case UNBAN_ITEM.SUCCESS:
            return {...state, unbanning: false};

        case UNBAN_ITEM.FAILURE:
            return {...state, unbanning: false};

        case CLOSE_UNBAN_MODAL:
            return {
                ...state,
                unbanVisible: false,
                unbanning: false,
                host: initialState.host,
            };

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
