import Button from '../../../components/Button/Button';
import React, {useCallback} from 'react';
import {Dialog, TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {createUserModalSlice} from '../../../store/reducers/users/create-user';
import {RootState} from '../../../store/reducers';
import {createUser} from '../../../store/actions/users-typed';
import { fetchUsers } from '../../../store/actions/users';

export const ShowCreateUserModalButton: React.FC = () => {
    const dispatch = useDispatch();
    const onClick = useCallback(() => {
        dispatch(createUserModalSlice.actions.setModalState({showModal: true, username: ''}));
    }, []);

    return (
        <Button view="action" onClick={onClick}>
            Create new
        </Button>
    );
};

export const CreateUserModal: React.FC = () => {
    const dispatch = useDispatch();
    const {showModal, username, loading} = useSelector(
        (state: RootState) => state.users.createUser,
    );

    const onClose = useCallback(() => {
        dispatch(
            createUserModalSlice.actions.setModalState({
                showModal: false,
                loading: false,
                username: '',
            }),
        );
    }, [dispatch]);

    const onApply = useCallback(async () => {
        dispatch(createUserModalSlice.actions.setModalState({loading: true}));
        await createUser({username});
        await dispatch(fetchUsers());
        onClose();
    }, [dispatch, username, onClose]);

    const onUpdate = useCallback(
        (value: string) => {
            dispatch(createUserModalSlice.actions.setModalState({username: value}));
        },
        [dispatch],
    );

    if (showModal) {
        return (
            <Dialog open={true} onClose={onClose}>
                <Dialog.Header caption={'Create user'} />
                <Dialog.Body>
                    <TextInput onUpdate={onUpdate} value={username} />
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    onClickButtonApply={onApply}
                    textButtonCancel="Cancel"
                    textButtonApply="Create"
                    loading={loading}
                />
            </Dialog>
        );
    }

    return null;
};
