import Button from '../../../components/Button/Button';
import React, {useCallback} from 'react';
import {useDispatch} from '../../../store/redux-hooks';
import {openGroupEditorModal} from '../../../store/actions/groups';
import UIFactory from '../../../UIFactory';

export const ShowCreateGroupModalButton: React.FC = () => {
    const dispatch = useDispatch();
    const onClick = useCallback(() => {
        dispatch(openGroupEditorModal());
    }, []);

    if (!UIFactory.getAclApi().groups.allowCreate) {
        return null;
    }

    return (
        <Button view="action" onClick={onClick}>
            Create new
        </Button>
    );
};
