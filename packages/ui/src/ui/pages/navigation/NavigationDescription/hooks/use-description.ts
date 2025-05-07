import {useSelector} from 'react-redux';

import {getDescriptionType, getEditMode} from '../../../../store/reducers/navigation/description';

import {useYTAnnotation} from './use-yt-annotation';
import {useExternalAnnotation} from './use-external-annotation';

export function useDescription() {
    const editMode = useSelector(getEditMode);
    const descriptionType = useSelector(getDescriptionType);

    const {ytAnnotation, isAnnotationLoadedWithData, isAnnotationLoading} = useYTAnnotation();

    const {externalAnnotation, isExternalAnnotatonLoadedWithData} = useExternalAnnotation();

    const isLoadedWithData =
        // use isAnnotationLoading to ensure that internal annotation loading process completed
        // before making any rendering decision
        !isAnnotationLoading && (isAnnotationLoadedWithData || isExternalAnnotatonLoadedWithData);

    const description = descriptionType === 'yt' ? ytAnnotation : externalAnnotation;

    return {
        visible: isLoadedWithData || editMode,
        descriptionType,
        description,
    };
}
