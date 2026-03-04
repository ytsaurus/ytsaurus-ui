import {useSelector} from '../../../../store/redux-hooks';

import {getPath} from '../../../../store/selectors/navigation';
import {useAnnotationQuery} from '../../../../store/api/navigation/tabs/description';
import {selectCluster} from '../../../../store/selectors/global';

export function useYTAnnotation() {
    const path: string = useSelector(getPath);

    const cluster = useSelector(selectCluster);

    const {
        data: annotationData,
        isSuccess: isAnnotationSuccess,
        isLoading,
    } = useAnnotationQuery({path, cluster});

    const {annotation_path, annotation} = annotationData ?? {};

    return {
        ytAnnotation: annotationData,
        ytAnnotationPath: annotation_path,
        isAnnotationLoadedWithData: Boolean(isAnnotationSuccess && annotation?.length),
        isAnnotationLoading: isLoading,
    };
}
