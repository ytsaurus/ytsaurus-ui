import React, {Dispatch, FC, SetStateAction, useCallback, useRef} from 'react';
import {Button, Flex, Link} from '@gravity-ui/uikit';

import Icon from '../../../components/Icon/Icon';

import {EditButtons} from './EditButtons';
import {SwitchDescription} from './SwitchDescription';
import {useUpdateAnnotation} from './hooks';

interface NavigationDescriptionOverviewProps {
    editMode: boolean;
    setEditMode: Dispatch<SetStateAction<boolean>>;
    ytAnnotation: string | undefined;
    externalAnnotationLink: string;
    annotationSwitch: {
        showSwitch?: boolean;
        showExternalDescription: boolean;
        setShowExternalDescription: Dispatch<SetStateAction<boolean>>;
    };
    edittingAnnotation?: string;
}

export const NavigationDescriptionOverview: FC<NavigationDescriptionOverviewProps> = ({
    ytAnnotation,
    externalAnnotationLink,
    editMode,
    setEditMode,
    annotationSwitch: {showSwitch, showExternalDescription, setShowExternalDescription},
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

    const showExternalEdit = showExternalDescription || (!ytAnnotation && externalAnnotationLink);

    return (
        <Flex direction={'row'} gap={4} alignItems={'center'}>
            {!showExternalEdit ? (
                <EditButtons
                    isSaving={isLoading}
                    editMode={editMode}
                    onEditClick={handleEditClick}
                    onSaveClick={handleSaveClick}
                    onCancelClick={handleCancelClick}
                />
            ) : (
                <Link href={`${externalAnnotationLink}/edit/description`} target="_blank">
                    <Button view="outlined">
                        <Icon awesome="pencil" />
                    </Button>
                </Link>
            )}
            {showSwitch && (
                <SwitchDescription
                    checked={showExternalDescription}
                    annotationLink={externalAnnotationLink}
                    onUpdate={(checked: boolean) => setShowExternalDescription(checked)}
                />
            )}
        </Flex>
    );
};
