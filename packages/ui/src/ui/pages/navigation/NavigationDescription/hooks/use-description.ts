import {useSelector} from '../../../../store/redux-hooks';

import {getDescriptionType} from '../../../../store/reducers/navigation/description';

import {useYTAnnotation} from './use-yt-annotation';
import {useExternalAnnotation} from './use-external-annotation';
import {useUpdateDescriptionTypeOnLoad} from './use-description-type-on-load';

export function useDescription() {
    const descriptionType = useSelector(getDescriptionType);

    const {
        ytAnnotation,
        ytAnnotationPath,
        isAnnotationLoadedWithData,
        isAnnotationLoading,
        annotationError,
    } = useYTAnnotation();

    const {
        externalAnnotation,
        path: externalAnnotationPath,
        isExternalAnnotatonLoadedWithData,
        isExternalAnnotationLoading,
        externalAnnotationError,
    } = useExternalAnnotation();

    const description: string | undefined =
        descriptionType === 'yt' ? ytAnnotation?.annotation : externalAnnotation;

    useUpdateDescriptionTypeOnLoad(isAnnotationLoadedWithData, isExternalAnnotatonLoadedWithData);

    return {
        loading: descriptionType === 'yt' ? isAnnotationLoading : isExternalAnnotationLoading,
        error: descriptionType === 'yt' ? annotationError : externalAnnotationError,
        descriptionType,
        description,
        path: descriptionType === 'yt' ? ytAnnotationPath : externalAnnotationPath,
    };
}
