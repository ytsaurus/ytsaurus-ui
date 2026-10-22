import {disableYTCacheTemporarily} from '../../../shared/constants/yt-api';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {deleteUserModalSlice} from '../reducers/users/delete-user';
import {type Dispatch} from 'redux';

export const deleteUser = ({username}: {username: string}): Promise<void> => {
    return yt.v3
        .remove({
            parameters: {
                path: `//sys/users/${username}`,
            },
        })
        .then((result: void) => {
            disableYTCacheTemporarily();
            return result;
        });
};

export const createUser = ({username}: {username: string}): Promise<void> => {
    return yt.v3
        .create({
            parameters: {
                type: 'user',
                attributes: {
                    name: username,
                },
            },
        })
        .then((result: void) => {
            disableYTCacheTemporarily();
            return result;
        });
};

export function showUserDeleteModal(usernameToDelete: string) {
    return (dispatch: Dispatch) => {
        dispatch(deleteUserModalSlice.actions.setModalState({usernameToDelete}));
    };
}

export function closeUserDeleteModal() {
    return (dispatch: Dispatch) => {
        dispatch(deleteUserModalSlice.actions.setModalState({usernameToDelete: ''}));
    };
}
