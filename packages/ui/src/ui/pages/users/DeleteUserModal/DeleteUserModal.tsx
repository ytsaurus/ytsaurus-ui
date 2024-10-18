import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store/reducers';
import {Dialog, Text} from '@gravity-ui/uikit';
import {deleteUserModalSlice} from '../../../store/reducers/users/delete-user';
import {deleteUser} from '../../../store/actions/users-typed';
import {fetchUsers} from '../../../store/actions/users';

export const DeleteUserModal: React.FC = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const {showModal, username} = useSelector((state: RootState) => state.users.deleteUser);

    const onClose = useCallback(() => {
        dispatch(deleteUserModalSlice.actions.setModalState({showModal: false}));
    }, [dispatch]);

    const onApply = useCallback(async () => {
        setLoading(true);
        await deleteUser({username});

        await new Promise((resolve) => setTimeout(resolve, 2 * 1000));

        dispatch(deleteUserModalSlice.actions.setModalState({showModal: false}));

        setLoading(false);

        await dispatch(fetchUsers());
    }, [dispatch, username]);

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
