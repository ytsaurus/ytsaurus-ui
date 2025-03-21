import React, {FC, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getSettingAnnotationVisibility} from '../../../store/selectors/settings';
import {setSettingAnnotationVisibility} from '../../../store/actions/settings/settings';
import {yt as ytApi} from '../../../store/api/yt';
import {getPath} from '../../../store/selectors/navigation';

import CollapsibleSection from '../../../components/CollapsibleSection/CollapsibleSection';
import {EditAnnotationWithPreview} from '../../../components/EditAnnotationWithPreview/EditAnnotationWithPreview';

import {NavigationDescriptionOverview} from './NavigationDescriptionOverview';
import {AnnotationWithPartial} from './AnnotationWithPartial';

import {AnnotationVisibility} from '../../../../shared/constants/settings-ts';
import {UI_COLLAPSIBLE_SIZE} from '../../../constants/global';

import {makeAnnotationFetchParams, useAnnotation} from './hooks';

import './NavigationDescription.scss';

const block = cn('navigation-description');

type Props = {
    className: string;
};

const NavigationDescription: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const path = useSelector(getPath);

    const visibility = useSelector(getSettingAnnotationVisibility);

    const [isEditing, setIsEditing] = useState(false);

    const {
        annotation: {annotation},
        isLoadedWithData,
        annotationSwitch,
        ytAnnotationData,
        externalAnnotaionData,
    } = useAnnotation(isEditing);

    const expanded = visibility === AnnotationVisibility.VISIBLE;

    const handleToggleAnnotationCollapse = useCallback(() => {
        dispatch(
            setSettingAnnotationVisibility(
                expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE,
            ),
        );
    }, [dispatch, expanded]);

    const handleChangeDescription = ({value}: {value: string | undefined}) => {
        dispatch(
            ytApi.util.updateQueryData('fetchBatch', makeAnnotationFetchParams(path), () => [
                {
                    output: value,
                },
            ]),
        );
    };

    if (!isLoadedWithData && !isEditing) {
        return null;
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
                        ytAnnotation={ytAnnotationData}
                        externalAnnotation={externalAnnotaionData}
                        isEditing={isEditing}
                        setIsEditing={setIsEditing}
                        annotationSwitch={annotationSwitch}
                    />
                }
            >
                <div className={block('content')}>
                    {isEditing ? (
                        <EditAnnotationWithPreview
                            valuePath={ytAnnotationData.annotationPath}
                            value={{value: ytAnnotationData.annotation}}
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
                </div>
            </CollapsibleSection>
        </div>
    );
};

export default NavigationDescription;
