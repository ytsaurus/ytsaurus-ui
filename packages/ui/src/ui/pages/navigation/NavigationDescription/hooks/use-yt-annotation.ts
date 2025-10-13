import {useSelector} from '../../../../store/redux-hooks';

import ypath from '../../../../common/thor/ypath';

import {getAttributes, getPath} from '../../../../store/selectors/navigation';
import {useAnnotationQuery} from '../../../../store/api/navigation/tabs/description';
import {getCluster} from '../../../../store/selectors/global';

export function useYTAnnotation() {
    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const attributes = useSelector(getAttributes);

    const {
        data: annotationData,
        isSuccess: isAnnotationSuccess,
        isLoading,
    } = useAnnotationQuery({path, cluster});

    const ytAnnotationPath = ypath.getValue(attributes, '/annotation_path');

    return {
        ytAnnotation: annotationData,
        ytAnnotationPath,
        isAnnotationLoadedWithData: Boolean(isAnnotationSuccess && annotationData?.length),
        isAnnotationLoading: isLoading,
    };
}
