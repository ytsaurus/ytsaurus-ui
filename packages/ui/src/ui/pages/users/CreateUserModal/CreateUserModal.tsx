import Button from '../../../components/Button/Button';
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {showUserEditorModal} from '../../../store/actions/users';
import {selectIsUserManagementEnabled} from '../../../store/selectors/global';

import i18n from './i18n';

export const ShowCreateUserModalButton: React.FC = () => {
    const dispatch = useDispatch();
    const onClick = useCallback(() => {
        dispatch(showUserEditorModal());
    }, []);

    const isEnabled = useSelector(selectIsUserManagementEnabled);

    if (isEnabled) {
        return (
            <Button view="action" onClick={onClick}>
                {i18n('action_create-new')}
            </Button>
        );
    }

    return null;
};
