import React, {Dispatch, FC, SetStateAction, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Flex} from '@gravity-ui/uikit';

import {getPath} from '../../../store/selectors/navigation';
import {yt as ytApi} from '../../../store/api/yt';

import {EditButtons} from './EditButtons';
import {SwitchDescription} from './SwitchDescription';
import {makeAnnotationFetchParams, useUpdateAnnotation} from './hooks';

interface Annotation {
    annotation?: string;
    annotationPath?: string;
}

interface NavigationDescriptionOverviewProps {
    isEditing: boolean;
    setIsEditing: Dispatch<SetStateAction<boolean>>;
    ytAnnotation: Annotation;
    externalAnnotation: Annotation;
    annotationSwitch: {
        showSwitch?: boolean;
        showExternalDescription: boolean;
        setShowExternalDescription: Dispatch<SetStateAction<boolean>>;
    };
}

export const NavigationDescriptionOverview: FC<NavigationDescriptionOverviewProps> = ({
    ytAnnotation: {annotation},
    externalAnnotation: {annotationPath},
    isEditing,
    setIsEditing,
    annotationSwitch: {showSwitch, showExternalDescription, setShowExternalDescription},
}) => {
    const dispatch = useDispatch();

    const path = useSelector(getPath);

    const oldValue = useRef<string>(annotation || '');

    const [updateFn, {isLoading}] = useUpdateAnnotation();

    const handleEditClick = useCallback(() => {
        oldValue.current = annotation || '';
        setIsEditing(true);
    }, [annotation, setIsEditing]);

    const handleCancelClick = useCallback(() => {
        dispatch(
            ytApi.util.updateQueryData('fetchBatch', makeAnnotationFetchParams(path), () => [
                {
                    output: oldValue.current,
                },
            ]),
        );
        setIsEditing(false);
    }, [dispatch, path, setIsEditing]);

    const handleSaveClick = useCallback(() => {
        updateFn(annotation || '');
        setIsEditing(false);
    }, [annotation, setIsEditing, updateFn]);

    return (
        <Flex direction={'row'} gap={4} alignItems={'center'}>
            <EditButtons
                isSaving={isLoading}
                editMode={isEditing}
                onEditClick={handleEditClick}
                onSaveClick={handleSaveClick}
                onCancelClick={handleCancelClick}
            />
            <>
                {showSwitch && (
                    <SwitchDescription
                        checked={showExternalDescription}
                        annotationLink={annotationPath}
                        onUpdate={(checked: boolean) => setShowExternalDescription(checked)}
                    />
                )}
            </>
        </Flex>
    );
};
