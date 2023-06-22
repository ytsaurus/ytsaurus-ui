import _ from 'lodash';
import ypath from '../../../../common/thor/ypath';

import {mergeStateOnClusterChange} from '../../../../store/reducers/utils';
import {
    CHANGE_USER_SUGGEST_LIST,
    CLOSE_CREATE_MODAL,
    FETCH_USERS,
    OPEN_CREATE_MODAL,
} from '../../../../constants/accounts/editor';

const initialState = {
    users: [],
    usersError: {},
    fetchingError: false,
    activeUserFilter: '',
    activeUserList: [],
    createModalVisible: false,
    deleteModalVisible: false,
    newAccountInfo: {},
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_USERS.SUCCESS: {
            const users = ypath.getValue(action.data);
            return {
                ...state,
                users: users,
                activeUserList: users,
            };
        }

        case FETCH_USERS.FAILURE:
            return {
                ...state,
                fetchingError: true,
                usersError: action.data.error,
            };

        case CHANGE_USER_SUGGEST_LIST: {
            const {newFilter} = action.data;
            const {users} = state;
            const activeUserFilter = newFilter;
            const filtered = _.filter(users, (user) =>
                user.toLowerCase().startsWith(activeUserFilter),
            );
            return {
                ...state,
                activeUserFilter: activeUserFilter,
                activeUserList: filtered,
            };
        }
        case OPEN_CREATE_MODAL: {
            return {
                ...state,
                createModalVisible: true,
            };
        }

        case CLOSE_CREATE_MODAL: {
            return {
                ...state,
                createModalVisible: false,
                newAccountInfo: action.data || {},
            };
        }

        default:
            return state;
    }
};

export default mergeStateOnClusterChange(initialState, {}, reducer);
