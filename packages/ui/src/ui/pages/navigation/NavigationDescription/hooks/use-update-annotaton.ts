import {useSelector} from '../../../../store/redux-hooks';

import {YTApiId} from '../../../../rum/rum-wrap-api';

import {useUpdateBatchMutation} from '../../../../store/api/yt';
import {selectPath} from '../../../../store/selectors/navigation';

import {prepareRequest} from '../../../../utils/navigation';

import i18n from './i18n';

export function useUpdateAnnotation() {
    const [update, rest] = useUpdateBatchMutation<string>();
    const path = useSelector(selectPath);

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
            errorTitle: i18n('alert_failed-to-update-annotation'),
            toaster: {
                toasterName: 'update_annotation',
                successTitle: i18n('alert_annotation-saved'),
                errorTitle: i18n('alert_failed-to-save-annotation'),
            },
        });

    return [updateFn, rest] as const;
}
