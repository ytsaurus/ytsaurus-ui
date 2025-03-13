import React, {Dispatch, FC, SetStateAction, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Flex} from '@gravity-ui/uikit';

import {
    getNavigationAnnotationEditing,
    getNavigationAnnotationSaving,
} from '../../../store/selectors/navigation/tabs/annotation';
import {getPath} from '../../../store/selectors/navigation';
import {saveAnnotation} from '../../../store/actions/navigation/tabs/annotation';

import {
    SET_ANNOTATION,
    SET_ANNOTATION_EDITING,
} from '../../../constants/navigation/tabs/annotation';

import {EditButtons} from './EditButtons';
import {SwitchDescription} from './SwitchDescription';

interface NavigationDescriptionOverviewProps {
    annotation: string;
    annotationLink: string;
    showExternalDescription: boolean;
    setShowExternalDescription: Dispatch<SetStateAction<boolean>>;
}

export const NavigationDescriptionOverview: FC<NavigationDescriptionOverviewProps> = ({
    annotation,
    annotationLink,
    showExternalDescription,
    setShowExternalDescription,
}) => {
    const dispatch = useDispatch();

    const path = useSelector(getPath);
    const isSaving = useSelector(getNavigationAnnotationSaving);
    const isEditing = useSelector(getNavigationAnnotationEditing);

    const oldValue = useRef<string>(annotation);

    const handleEditClick = useCallback(() => {
        oldValue.current = annotation;
        dispatch({type: SET_ANNOTATION_EDITING, data: true});
    }, [annotation, dispatch]);

    const handleCancelClick = useCallback(() => {
        dispatch({type: SET_ANNOTATION, data: oldValue.current});
        dispatch({type: SET_ANNOTATION_EDITING, data: false});
    }, [dispatch]);

    const handleSaveClick = useCallback(() => {
        dispatch(saveAnnotation(path));
    }, [dispatch, path]);

    return (
        <Flex direction={'row'} gap={4} alignItems={'center'}>
            <EditButtons
                isSaving={isSaving}
                editMode={isEditing}
                onEditClick={handleEditClick}
                onSaveClick={handleSaveClick}
                onCancelClick={handleCancelClick}
            />
            <>
                {Boolean(annotation) && (
                    <SwitchDescription
                        checked={showExternalDescription}
                        annotationLink={annotationLink}
                        onUpdate={(checked: boolean) => setShowExternalDescription(checked)}
                    />
                )}
            </>
        </Flex>
    );
};
