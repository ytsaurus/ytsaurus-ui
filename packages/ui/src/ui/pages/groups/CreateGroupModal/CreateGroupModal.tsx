import Button from '../../../components/Button/Button';
import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {openGroupEditorModal} from '../../../store/actions/groups';
import {isIdmAclAvailable} from '../../../config';

export const ShowCreateGroupModalButton: React.FC = () => {
    const dispatch = useDispatch();
    const onClick = useCallback(() => {
        dispatch(openGroupEditorModal());
    }, []);

    if (isIdmAclAvailable()) {
        return null;
    }

    return (
        <Button view="action" onClick={onClick}>
            Create new
        </Button>
    );
};
