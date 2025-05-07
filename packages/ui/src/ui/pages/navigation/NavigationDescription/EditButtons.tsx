import React from 'react';
import {useSelector} from 'react-redux';
import {Button, Flex} from '@gravity-ui/uikit';

import {getEditMode} from '../../../store/reducers/navigation/description';

import Icon from '../../../components/Icon/Icon';

import {useDescriptionActions} from './hooks/use-description-actions';

export function EditButtons() {
    const editMode = useSelector(getEditMode);

    const {edit, save, cancel, isLoading} = useDescriptionActions();

    return editMode ? (
        <Flex gap={1}>
            <Button view={'action'} onClick={save} loading={isLoading}>
                Save
            </Button>
            <Button view={'flat'} onClick={cancel}>
                Cancel
            </Button>
        </Flex>
    ) : (
        <Button view={'outlined'} onClick={edit}>
            <Icon awesome={'pencil'} />
        </Button>
    );
}
