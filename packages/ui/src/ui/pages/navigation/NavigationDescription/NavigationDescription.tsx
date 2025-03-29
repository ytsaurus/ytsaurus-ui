import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getSettingAnnotationVisibility} from '../../../store/selectors/settings';
import {setSettingAnnotationVisibility} from '../../../store/actions/settings/settings';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {EditAnnotationWithPreview} from '../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';

import {NavigationDescriptionOverview} from './NavigationDescriptionOverview';
import {AnnotationWithPartial} from './AnnotationWithPartial';

import {AnnotationVisibility} from '../../../../shared/constants/settings-ts';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {useAnnotation, useExternalAnnotation} from './hooks';

import './NavigationDescription.scss';

const block = cn('navigation-description');

type Props = {
    className: string;
};

function NavigationDescription({className}: Props) {
    const dispatch = useDispatch();

    const visibility = useSelector(getSettingAnnotationVisibility);

    const [editMode, setEditMode] = useState(false);
    const [showExternalDescription, setShowExternalDescription] = useState(false);

    const {ytAnnotation, ytAnnotationPath, isAnnotationLoadedWithData, isAnnotationLoading} =
        useAnnotation();

    const {externalAnnotation, externalAnnotationLink, isExternalAnnotatonLoadedWithData} =
        useExternalAnnotation();

    const [edittingAnnotation, setEdittingAnnotation] = useState<string | undefined>(ytAnnotation);

    const expanded = visibility === AnnotationVisibility.VISIBLE;

    const handleToggleAnnotationCollapse = useCallback(() => {
        dispatch(
            setSettingAnnotationVisibility(
                expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE,
            ),
        );
    }, [dispatch, expanded]);

    const handleChangeDescription = ({value}: {value: string | undefined}) => {
        setEdittingAnnotation(value);
    };

    const showSwitch = Boolean(ytAnnotation && externalAnnotation && !editMode);

    const isLoadedWithData =
        // use isAnnotationLoading to ensure that internal annotation loading process completed
        // before making any rendering decision
        !isAnnotationLoading && (isAnnotationLoadedWithData || isExternalAnnotatonLoadedWithData);

    if (!isLoadedWithData && !editMode) {
        return null;
    }

    let annotation = '';

    if (!showExternalDescription && isAnnotationLoadedWithData) {
        annotation = ytAnnotation || '';
    }

    if (
        showExternalDescription ||
        (!isAnnotationLoadedWithData && isExternalAnnotatonLoadedWithData)
    ) {
        annotation = externalAnnotation || '';
    }

    return (
        <div className={block(null, className)}>
            <CollapsibleSection
                className={block('collapsible')}
                name={'Description'}
                collapsed={false}
                size={UI_COLLAPSIBLE_SIZE}
                overview={
                    <NavigationDescriptionOverview
                        ytAnnotation={ytAnnotation}
                        externalAnnotationLink={externalAnnotationLink || ''}
                        editMode={editMode}
                        setEditMode={setEditMode}
                        annotationSwitch={{
                            showSwitch,
                            showExternalDescription,
                            setShowExternalDescription,
                        }}
                        edittingAnnotation={edittingAnnotation}
                    />
                }
            >
                <div className={block('content')}>
                    {editMode ? (
                        <EditAnnotationWithPreview
                            valuePath={ytAnnotationPath}
                            value={{value: edittingAnnotation ?? ytAnnotation}}
                            initialValue={{value: ytAnnotation}}
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
                </div>
            </CollapsibleSection>
        </div>
    );
}

export default NavigationDescription;
