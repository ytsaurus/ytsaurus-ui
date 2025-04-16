import React, {Dispatch, FC, SetStateAction, useCallback, useRef} from 'react';
import {Button, Flex, Link} from '@gravity-ui/uikit';

import Icon from '../../../components/Icon/Icon';

import {EditButtons} from './EditButtons';
import {SwitchDescription} from './SwitchDescription';
import {useUpdateAnnotation} from './hooks';

interface NavigationDescriptionOverviewProps {
    editMode: boolean;
    setEditMode: Dispatch<SetStateAction<boolean>>;
    descriptionType: 'yt' | 'external';
    setDescriptionType: Dispatch<SetStateAction<'yt' | 'external'>>;
    externalAnnotationLink?: string;
    ytAnnotation?: string;
    edittingAnnotation?: string;
}

export const NavigationDescriptionOverview: FC<NavigationDescriptionOverviewProps> = ({
    ytAnnotation,
    externalAnnotationLink,
    descriptionType,
    setDescriptionType,
    editMode,
    setEditMode,
    edittingAnnotation,
}) => {
    const oldValue = useRef<string>(ytAnnotation || '');

    const [updateFn, {isLoading}] = useUpdateAnnotation();

    const handleEditClick = useCallback(() => {
        oldValue.current = ytAnnotation || '';
        setEditMode(true);
    }, [ytAnnotation, setEditMode]);

    const handleCancelClick = useCallback(() => {
        setEditMode(false);
    }, [setEditMode]);

    const handleSaveClick = useCallback(() => {
        updateFn(edittingAnnotation || '');
        setEditMode(false);
    }, [setEditMode, updateFn, edittingAnnotation]);

    return (
        <Flex direction={'row'} gap={4} alignItems={'center'}>
            <SwitchDescription
                descriptionType={descriptionType}
                setDescriptionType={setDescriptionType}
            />
            {descriptionType === 'yt' && (
                <EditButtons
                    isSaving={isLoading}
                    editMode={editMode}
                    onEditClick={handleEditClick}
                    onSaveClick={handleSaveClick}
                    onCancelClick={handleCancelClick}
                />
            )}
            {descriptionType === 'external' && (
                <Link href={externalAnnotationLink || ''} target="_blank">
                    <Button view="outlined">
                        <Icon awesome="pencil" />
                    </Button>
                </Link>
            )}
        </Flex>
    );
};
