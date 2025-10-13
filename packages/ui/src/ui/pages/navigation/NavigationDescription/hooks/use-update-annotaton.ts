import {useSelector} from '../../../../store/redux-hooks';

import {YTApiId} from '../../../../rum/rum-wrap-api';

import {useUpdateBatchMutation} from '../../../../store/api/yt';
import {getPath} from '../../../../store/selectors/navigation';

import {prepareRequest} from '../../../../utils/navigation';

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
                            path: `${path}&`,
                        }),
                        input: annotation,
                    },
                ],
            },
            errorTitle: 'Failed to update annotation',
            toaster: {
                toasterName: 'update_annotation',
                successTitle: 'Annotation saved',
                errorTitle: 'Failed to save annotation',
            },
        });

    return [updateFn, rest] as const;
}
