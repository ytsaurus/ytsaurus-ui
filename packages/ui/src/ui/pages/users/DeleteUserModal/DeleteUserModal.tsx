import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {type RootState} from '../../../store/reducers';
import {Text} from '@gravity-ui/uikit';
import {closeUserDeleteModal, deleteUser} from '../../../store/actions/users-typed';
import {fetchUsers} from '../../../store/actions/users';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {type YTError} from '../../../types';
import {disableUsersCache} from '../../../utils/users-groups';

import i18n from './i18n';

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

            disableUsersCache();
            // we don't need to wait for the end of the action
            dispatch(fetchUsers());
        } catch (error) {
            setError(error as YTError);
        }
    }, [dispatch, usernameToDelete, onClose]);

    return (
        <YTDFDialog
            visible={Boolean(usernameToDelete)}
            headerProps={{title: i18n('title_delete-user', {username: usernameToDelete})}}
            pristineSubmittable={true}
            onClose={onClose}
            onAdd={onAdd}
            fields={[
                {
                    name: 'username',
                    type: 'block',
                    extras: {
                        children: (
                            <Text>{i18n('confirm_delete-user', {username: usernameToDelete})}</Text>
                        ),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
};
