import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store/reducers';
import {Dialog, Text} from '@gravity-ui/uikit';
import {closeUserDeleteModal, deleteUser} from '../../../store/actions/users-typed';
import {fetchUsers} from '../../../store/actions/users';

export const DeleteUserModal: React.FC = () => {
    const dispatch = useDispatch();
    const usernameToDelete = useSelector(
        (state: RootState) => state.users.deleteUser.usernameToDelete,
    );

    const onClose = useCallback(() => {
        dispatch(closeUserDeleteModal());
    }, [dispatch]);

    const onApply = useCallback(async () => {
        await deleteUser({username: usernameToDelete});

        await new Promise((resolve) => setTimeout(resolve, 2 * 1000));

        onClose();

        await dispatch(fetchUsers());
    }, [dispatch, usernameToDelete, onClose]);

    if (!usernameToDelete) {
        return null;
    }

    return (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header caption={'Delete user'} />
            <Dialog.Body>
                <Text>Are you sure you want to delete &quot;{usernameToDelete}&quot;?</Text>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={onApply}
                textButtonCancel="Cancel"
                textButtonApply="Delete"
            />
        </Dialog>
    );
};
