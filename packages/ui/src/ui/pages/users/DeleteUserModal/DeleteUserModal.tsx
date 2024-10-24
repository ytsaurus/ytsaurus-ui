import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store/reducers';
import {Text} from '@gravity-ui/uikit';
import {closeUserDeleteModal, deleteUser} from '../../../store/actions/users-typed';
import {fetchUsers} from '../../../store/actions/users';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {YTError} from '../../../types';

export const DeleteUserModal: React.FC = () => {
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError | undefined>(undefined);
    const usernameToDelete = useSelector(
        (state: RootState) => state.users.deleteUser.usernameToDelete,
    );

    const onClose = useCallback(() => {
        dispatch(closeUserDeleteModal());
    }, [dispatch]);

    const onAdd = useCallback(async () => {
        try {
            setError(undefined);

            await deleteUser({username: usernameToDelete});

            onClose();

            // we don't need to wait for the end of the action
            dispatch(fetchUsers());
        } catch (error) {
            setError(error as YTError);
        }
    }, [dispatch, usernameToDelete, onClose]);

    return (
        <YTDFDialog
            visible={Boolean(usernameToDelete)}
            headerProps={{title: `Delete user ${usernameToDelete}`}}
            pristineSubmittable={true}
            onClose={onClose}
            onAdd={onAdd}
            fields={[
                {
                    name: 'username',
                    type: 'block',
                    extras: {
                        children: (
                            <Text>
                                Are you sure you want to delete &quot;{usernameToDelete}&quot;?
                            </Text>
                        ),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
};
