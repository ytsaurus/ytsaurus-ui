import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {setSettingAnnotationVisibility} from '../../../../store/actions/settings/settings';
import {
    getDescriptionType,
    getEditMode,
    getEdittingAnnotation,
} from '../../../../store/reducers/navigation/navigation-description';
import {getSettingAnnotationVisibility} from '../../../../store/selectors/settings';

import {AnnotationVisibility} from '../../../../../shared/constants/settings-ts';

import {useYTAnnotation} from './use-yt-annotation';
import {useExternalAnnotation} from './use-external-annotation';
import {useDescriptionTypeOnLoad} from './use-description-type-on-load';

export function useDescription() {
    const dispatch = useDispatch();

    const visibility = useSelector(getSettingAnnotationVisibility);
    const editMode = useSelector(getEditMode);
    const edittingAnnotation = useSelector(getEdittingAnnotation);
    const descriptionType = useSelector(getDescriptionType);

    const {ytAnnotation, ytAnnotationPath, isAnnotationLoadedWithData, isAnnotationLoading} =
        useYTAnnotation();

    const {externalAnnotation, isExternalAnnotatonLoadedWithData} = useExternalAnnotation();

    useDescriptionTypeOnLoad(isAnnotationLoadedWithData, isExternalAnnotatonLoadedWithData);

    const expanded = visibility === AnnotationVisibility.VISIBLE;

    const toggleExpanded = useCallback(() => {
        dispatch(
            setSettingAnnotationVisibility(
                expanded ? AnnotationVisibility.PARTIAL : AnnotationVisibility.VISIBLE,
            ),
        );
    }, [dispatch, expanded]);

    const isLoadedWithData =
        // use isAnnotationLoading to ensure that internal annotation loading process completed
        // before making any rendering decision
        !isAnnotationLoading && (isAnnotationLoadedWithData || isExternalAnnotatonLoadedWithData);

    const annotation = descriptionType === 'yt' ? ytAnnotation : externalAnnotation;

    return {
        visible: isLoadedWithData || editMode,
        annotation,
        editMode,
        expanded,
        toggleExpanded,
        edittingAnnotation,
        ytAnnotationPath,
    };
}
