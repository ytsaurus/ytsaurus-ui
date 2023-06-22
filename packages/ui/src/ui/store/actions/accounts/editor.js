import {
    CLOSE_CREATE_MODAL,
    FETCH_USERS,
    OPEN_CREATE_MODAL,
} from '../../../constants/accounts/editor';
import {listAllUsers} from '../../../utils/users-groups';
import {YTApiId} from '../../../rum/rum-wrap-api';

export function loadUsers() {
    return (dispatch) => {
        return listAllUsers(YTApiId.listUsers)
            .then((data) => {
                dispatch({
                    type: FETCH_USERS.SUCCESS,
                    data,
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_USERS.FAILURE,
                    error,
                });
            });
    };
}

export function openCreateModal(account) {
    return {
        type: OPEN_CREATE_MODAL,
        data: {account},
    };
}

export function closeCreateModal(newAccountInfo) {
    return {
        type: CLOSE_CREATE_MODAL,
        data: newAccountInfo,
    };
}
