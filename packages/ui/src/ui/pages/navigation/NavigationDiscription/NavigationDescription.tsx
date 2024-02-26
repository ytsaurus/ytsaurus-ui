import React, {FC, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import ErrorBlock from '../../../components/Error/Error';
import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {
    getNavigationAnnotation,
    getNavigationAnnotationEditing,
    getNavigationAnnotationError,
    getNavigationAnnotationPath,
    getNavigationAnnotationSaving,
} from '../../../store/selectors/navigation/tabs/annotation';
import {getPath} from '../../../store/selectors/navigation';
import {getSettingAnnotationVisibility} from '../../../store/selectors/settings';
import {setSettingAnnotationVisibility} from '../../../store/actions/settings/settings';
import {AnnotationVisibility} from '../../../../shared/constants/settings-ts';
import './NavigationDescription.scss';
import {AnnotationWithPartial} from './AnnotationWithPartial';
import {ActionButtons} from './ActionButtons';
import {EditAnnotationWithPreview} from '../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';
import {saveAnnotation} from '../../../store/actions/navigation/tabs/annotation';
import {SET_ANNOTATION_EDITING} from '../../../constants/navigation/tabs/annotation';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

const block = cn('navigation-description');

type Props = {
    className: string;
};

const NavigationDescription: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const annotation = useSelector(getNavigationAnnotation) || '';
    const visibility = useSelector(getSettingAnnotationVisibility);
    const path = useSelector(getPath);
    const isSaving = useSelector(getNavigationAnnotationSaving);
    const isEditing = useSelector(getNavigationAnnotationEditing);
    const annotationPath = useSelector(getNavigationAnnotationPath);
    const error = useSelector(getNavigationAnnotationError);
    const newAnnotation = useRef<string>(annotation);

    const expanded = visibility === AnnotationVisibility.VISIBLE;
    const handleToggleAnnotationCollapse = useCallback(() => {
        dispatch(
            setSettingAnnotationVisibility(
                expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE,
            ),
        );
    }, [dispatch, expanded]);

    const handleEditClick = useCallback(() => {
        dispatch({type: SET_ANNOTATION_EDITING, data: true});
    }, [dispatch]);

    const handleCancelClick = useCallback(() => {
        newAnnotation.current = annotation;
        dispatch({type: SET_ANNOTATION_EDITING, data: false});
    }, [annotation, dispatch]);

    const handleChangeDescription = useCallback(({value}: {value: string | undefined}) => {
        newAnnotation.current = value || '';
    }, []);

    const handleSaveClick = useCallback(() => {
        dispatch(saveAnnotation({path, annotation: newAnnotation.current}));
    }, [dispatch, path]);

    if (!(path === annotationPath && (error || annotation))) return null;

    return (
        <div className={block(null, className)}>
            <CollapsibleSection
                className={block('collapsible')}
                name={'Description'}
                collapsed={false}
                size={UI_COLLAPSIBLE_SIZE}
                overview={
                    <ActionButtons
                        isSaving={isSaving}
                        editMode={isEditing}
                        onEditClick={handleEditClick}
                        onSaveClick={handleSaveClick}
                        onCancelClick={handleCancelClick}
                    />
                }
            >
                <div className={block('content')}>
                    {isEditing ? (
                        <EditAnnotationWithPreview
                            valuePath={path}
                            value={{value: newAnnotation.current}}
                            initialValue={{value: annotation}}
                            onChange={handleChangeDescription}
                            className={block('edit-block')}
                            hideReset
                        />
                    ) : (
                        <AnnotationWithPartial
                            annotation={annotation}
                            expanded={expanded}
                            onToggle={handleToggleAnnotationCollapse}
                        />
                    )}
                    {error && <ErrorBlock error={error} />}
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default NavigationDescription;
