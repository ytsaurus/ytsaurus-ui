import {useState} from 'react';
import {useSelector} from 'react-redux';

import {YTApiId} from '../../../rum/rum-wrap-api';
import ypath from '../../../common/thor/ypath';

import {getAttributes, getPath} from '../../../store/selectors/navigation';
import {getCluster} from '../../../store/selectors/global';
import {useFetchBatchQuery, useUpdateBatchMutation} from '../../../store/api/yt';
import {useGetExternalDescriptionQuery} from '../../../store/api/pages/navigation/tabs/description';

import {prepareRequest} from '../../../utils/navigation';

export const makeAnnotationFetchParams = (path: string) => ({
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

export function useAnnotation(isEditing: boolean) {
    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const attributes = useSelector(getAttributes);

    const [showExternalDescription, setShowExternalDescription] = useState(false);

    const {
        data: annotationData,
        isSuccess: isAnnotationSuccess,
        isLoading,
    } = useFetchBatchQuery<string>(makeAnnotationFetchParams(path));

    const {data: externalAnnotaionData, isSuccess: isExternalAnnotationSuccess} =
        useGetExternalDescriptionQuery({cluster, path});

    const showSwitch = Boolean(
        (annotationData?.[0].output || isEditing) && externalAnnotaionData?.externalAnnotation,
    );

    const isAnnotationLoadedWithData = Boolean(
        isAnnotationSuccess && annotationData?.[0]?.output?.length,
    );
    const isExternalAnnotatonLoadedWithData = Boolean(
        isExternalAnnotationSuccess && externalAnnotaionData.externalAnnotation,
    );

    const ytAnnotationPath = ypath.getValue(attributes, '/annotation_path');

    const resultAnnotation = {
        annotation: '',
        annotationPath: '',
    };

    if (!showExternalDescription && isAnnotationLoadedWithData) {
        const [{output: annotation}] = annotationData!;
        resultAnnotation.annotation = annotation!;
        resultAnnotation.annotationPath = ytAnnotationPath;
    }

    if (
        showExternalDescription ||
        (!isAnnotationLoadedWithData && isExternalAnnotatonLoadedWithData)
    ) {
        const {externalAnnotation, externalAnnotationLink} = externalAnnotaionData!;
        resultAnnotation.annotation = externalAnnotation || '';
        resultAnnotation.annotationPath = externalAnnotationLink || '';
    }

    return {
        annotation: resultAnnotation,
        ytAnnotationData: {
            annotation: annotationData?.[0]?.output,
            annotationPath: ytAnnotationPath,
            isLoadedWithData: isAnnotationSuccess && annotationData?.[0]?.output?.length,
        },
        externalAnnotaionData: {
            annotation: externalAnnotaionData?.externalAnnotation,
            annotationPath: externalAnnotaionData?.externalAnnotationLink,
            isLoadedWithData: isExternalAnnotatonLoadedWithData,
        },
        isLoadedWithData:
            // use isLoading to ensure that internal annotation loading process completed
            // before making any rendering decision
            !isLoading && (isAnnotationLoadedWithData || isExternalAnnotatonLoadedWithData),
        annotationSwitch: {showSwitch, showExternalDescription, setShowExternalDescription},
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
