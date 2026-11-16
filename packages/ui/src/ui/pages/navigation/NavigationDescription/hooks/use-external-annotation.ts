import {useSelector} from '../../../../store/redux-hooks';

import {selectPath} from '../../../../store/selectors/navigation';
import {selectCluster} from '../../../../store/selectors/global';
import {useExternalDescriptionQuery} from '../../../../store/api/navigation/tabs/description';

export function useExternalAnnotation() {
    const path: string = useSelector(selectPath);
    const cluster = useSelector(selectCluster);

    const {
        currentData: externalAnnotaionData,
        isSuccess: isExternalAnnotationSuccess,
        isFetching,
        error,
    } = useExternalDescriptionQuery({cluster, path});

    const isExternalAnnotatonLoadedWithData = Boolean(
        isExternalAnnotationSuccess && externalAnnotaionData?.externalAnnotation,
    );

    return {
        ...externalAnnotaionData,
        isExternalAnnotatonLoadedWithData,
        isExternalAnnotationLoading: isFetching,
        externalAnnotationError: error,
    };
}
