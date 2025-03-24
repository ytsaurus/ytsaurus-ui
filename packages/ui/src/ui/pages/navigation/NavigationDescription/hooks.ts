import {useSelector} from 'react-redux';

import {YTApiId} from '../../../rum/rum-wrap-api';
import ypath from '../../../common/thor/ypath';

import {getAttributes, getPath} from '../../../store/selectors/navigation';
import {getCluster} from '../../../store/selectors/global';
import {useFetchBatchQuery, useUpdateBatchMutation} from '../../../store/api/yt';
import {useGetExternalDescriptionQuery} from '../../../store/api/pages/navigation/tabs/description';

import {prepareRequest} from '../../../utils/navigation';

const makeAnnotationFetchParams = (path: string) => ({
    id: YTApiId.navigationGetAnnotation,
    parameters: {
        requests: [
            {
                command: 'get' as const,
                parameters: prepareRequest('/@annotation', {
                    path,
                }),
            },
        ],
    },
});

export function useAnnotation() {
    const path: string = useSelector(getPath);
    const attributes = useSelector(getAttributes);

    const {
        data: annotationData,
        isSuccess: isAnnotationSuccess,
        isLoading,
    } = useFetchBatchQuery<string>(makeAnnotationFetchParams(path));

    const ytAnnotationPath = ypath.getValue(attributes, '/annotation_path');

    return {
        ytAnnotation: annotationData?.[0]?.output,
        ytAnnotationPath,
        isAnnotationLoadedWithData: isAnnotationSuccess && annotationData?.[0]?.output?.length,
        isAnnotationLoading: isLoading,
    };
}

export function useExternalAnnotation() {
    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);

    const {data: externalAnnotaionData, isSuccess: isExternalAnnotationSuccess} =
        useGetExternalDescriptionQuery({cluster, path});

    const isExternalAnnotatonLoadedWithData = Boolean(
        isExternalAnnotationSuccess && externalAnnotaionData.externalAnnotation,
    );

    return {
        externalAnnotation: externalAnnotaionData?.externalAnnotation,
        externalAnnotationLink: externalAnnotaionData?.externalAnnotationLink,
        isExternalAnnotatonLoadedWithData,
    };
}

export function useUpdateAnnotation() {
    const [update, rest] = useUpdateBatchMutation<string>();
    const path = useSelector(getPath);

    const updateFn = (annotation: string) =>
        update({
            id: YTApiId.navigationGetAnnotation,
            parameters: {
                requests: [
                    {
                        command: 'set' as const,
                        parameters: prepareRequest('/@annotation', {
                            path,
                        }),
                        input: annotation,
                    },
                ],
            },
            toaster: {
                toasterName: 'update_annotation',
                successTitle: 'Annotation saved',
                errorTitle: 'Failed to save annotation',
            },
        });

    return [updateFn, rest] as const;
}
