import {useSelector} from 'react-redux';

import {getPath} from '../../../../store/selectors/navigation';
import {getCluster} from '../../../../store/selectors/global';
import {useExternalDescriptionQuery} from '../../../../store/api/navigation/tabs/description';

export function useExternalAnnotation() {
    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);

    const {data: externalAnnotaionData, isSuccess: isExternalAnnotationSuccess} =
        useExternalDescriptionQuery({cluster, path});

    const isExternalAnnotatonLoadedWithData = Boolean(
        isExternalAnnotationSuccess && externalAnnotaionData?.externalAnnotation,
    );

    return {
        externalAnnotation: externalAnnotaionData?.externalAnnotation,
        externalAnnotationLink: externalAnnotaionData?.externalAnnotationLink,
        isExternalAnnotatonLoadedWithData,
    };
}
