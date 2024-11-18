import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../store/reducers';
import {Text} from '@gravity-ui/uikit';
import {closeGroupDeleteModal, deleteGroup, fetchGroups} from '../../../store/actions/groups';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {YTError} from '../../../types';

export const DeleteGroupModal: React.FC = () => {
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError | undefined>(undefined);
    const groupNameToDelete = useSelector(
        (state: RootState) => state.groups.deleteGroup.groupNameToDelete,
    );

    const onClose = useCallback(() => {
        dispatch(closeGroupDeleteModal());
    }, [dispatch]);

    const onAdd = useCallback(async () => {
        try {
            setError(undefined);

            await deleteGroup({groupName: groupNameToDelete});

            onClose();

            // we don't need to wait for the end of the action
            dispatch(fetchGroups());
        } catch (error) {
            setError(error as YTError);
        }
    }, [dispatch, groupNameToDelete, onClose]);

    return (
        <YTDFDialog
            visible={Boolean(groupNameToDelete)}
            headerProps={{title: `Delete group ${groupNameToDelete}`}}
            pristineSubmittable={true}
            onClose={onClose}
            onAdd={onAdd}
            fields={[
                {
                    name: 'groupname',
                    type: 'block',
                    extras: {
                        children: (
                            <Text>
                                Are you sure you want to delete &quot;{groupNameToDelete}&quot;?
                            </Text>
                        ),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
};
