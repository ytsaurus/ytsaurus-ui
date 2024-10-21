import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store/reducers';
import {Dialog, Text} from '@gravity-ui/uikit';
import {deleteUserModalSlice} from '../../../store/reducers/users/delete-user';
import {deleteUser} from '../../../store/actions/users-typed';
import {fetchUsers} from '../../../store/actions/users';

export const DeleteUserModal: React.FC = () => {
    const dispatch = useDispatch();
    const {showModal, username, loading} = useSelector(
        (state: RootState) => state.users.deleteUser,
    );

    const onClose = useCallback(() => {
        dispatch(
            deleteUserModalSlice.actions.setModalState({
                showModal: false,
                loading: false,
                username: '',
            }),
        );
    }, [dispatch]);

    const onApply = useCallback(async () => {
        dispatch(deleteUserModalSlice.actions.setModalState({loading: true}));

        await deleteUser({username});

        await new Promise((resolve) => setTimeout(resolve, 2 * 1000));

        onClose();

        await dispatch(fetchUsers());
    }, [dispatch, username, onClose]);

    if (!showModal) {
        return null;
    }

    return (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header caption={'Delete user'} />
            <Dialog.Body>
                <Text>Are you sure you want to delete &quot;{username}&quot;?</Text>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={onApply}
                textButtonCancel="Cancel"
                textButtonApply="Delete"
                loading={loading}
            />
        </Dialog>
    );
};
