import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {Text} from '@gravity-ui/uikit';
import {deleteGroup, fetchGroups} from '../../../store/actions/groups';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog';
import {YTError} from '../../../types';
import {disableGroupsCache} from '../../../utils/users-groups';

type DeleteGroupModalProps = {
    group: string;
    onClose: () => void;
};

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({group, onClose}) => {
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError | undefined>(undefined);

    const onAdd = useCallback(async () => {
        try {
            setError(undefined);

            await deleteGroup({groupName: group});

            onClose();

            disableGroupsCache();
            // we don't need to wait for the end of the action
            dispatch(fetchGroups());
        } catch (error) {
            setError(error as YTError);
        }
    }, [dispatch, group, onClose]);

    return (
        <YTDFDialog
            visible={true}
            headerProps={{title: `Delete group ${group}`}}
            pristineSubmittable={true}
            onClose={onClose}
            onAdd={onAdd}
            fields={[
                {
                    name: 'groupname',
                    type: 'block',
                    extras: {
                        children: <Text>Are you sure you want to delete &quot;{group}&quot;?</Text>,
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
};
