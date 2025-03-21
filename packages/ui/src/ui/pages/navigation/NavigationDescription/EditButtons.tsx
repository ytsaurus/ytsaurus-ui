import React, {FC} from 'react';
import {Button, Flex} from '@gravity-ui/uikit';
import Icon from '../../../components/Icon/Icon';

type Props = {
    isSaving: boolean;
    editMode: boolean;
    onEditClick: () => void;
    onCancelClick: () => void;
    onSaveClick: () => void;
};

export const EditButtons: FC<Props> = ({
    isSaving,
    editMode,
    onEditClick,
    onSaveClick,
    onCancelClick,
}) => {
    if (editMode)
        return (
            <Flex gap={1}>
                <Button view="action" onClick={onSaveClick} loading={isSaving}>
                    Save
                </Button>
                <Button view="flat" onClick={onCancelClick}>
                    Cancel
                </Button>
            </Flex>
        );

    return (
        <Button view="outlined" onClick={onEditClick}>
            <Icon awesome={'pencil'} />
        </Button>
    );
};
