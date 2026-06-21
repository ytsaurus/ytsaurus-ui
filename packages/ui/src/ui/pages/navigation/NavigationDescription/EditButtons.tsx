import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {Button, Flex} from '@gravity-ui/uikit';

import {getEditMode} from '../../../store/reducers/navigation/description';

import Icon from '../../../components/Icon/Icon';

import {useDescriptionActions} from './hooks/use-description-actions';
import i18n from './i18n';

export function EditButtons({readonly}: {readonly?: boolean}) {
    const editMode = useSelector(getEditMode);

    const {edit, save, cancel, isLoading, isSaving} = useDescriptionActions();

    return editMode ? (
        <Flex gap={1}>
            <Button view={'action'} onClick={save} loading={isLoading || isSaving}>
                {i18n('action_save')}
            </Button>
            <Button view={'flat'} onClick={cancel} disabled={isSaving}>
                {i18n('action_cancel')}
            </Button>
        </Flex>
    ) : readonly ? null : (
        <Button view={'outlined'} onClick={edit}>
            <Icon awesome={'pencil'} />
        </Button>
    );
}
