import Button from '../../../components/Button/Button';
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {showUserEditorModal} from '../../../store/actions/users';
import {getUserManagementEnabled} from '../../../store/selectors/global';

export const ShowCreateUserModalButton: React.FC = () => {
    const dispatch = useDispatch();
    const onClick = useCallback(() => {
        dispatch(showUserEditorModal());
    }, []);

    const isEnabled = useSelector(getUserManagementEnabled);

    if (isEnabled) {
        return (
            <Button view="action" onClick={onClick}>
                Create new
            </Button>
        );
    }

    return null;
};
