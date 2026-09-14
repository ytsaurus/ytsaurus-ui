import {type YTError} from '../../../../@types/types';
import {YTApiId} from '../../../rum/rum-wrap-api';
import {useLazyGetOperationQuery} from '../../../store/api/yt';
import {useSelector} from '../../../store/redux-hooks';
import {selectIsCumulativeSpecPatchSupported} from '../../../store/selectors/global/supported-features';
import {showErrorPopup} from '../../../utils/utils';
import {type OperationEditAttributes} from '../../../utils/operations/edit-operation';

const OPERATION_EDIT_ATTRIBUTES = ['id', 'state', 'full_spec', 'runtime_parameters'] as const;

export function useOperationEditorData(operationId: string) {
    const isCumulativeSpecPatchSupported = useSelector(selectIsCumulativeSpecPatchSupported);
    const [getOperation, {data: operationAttributes, isFetching, originalArgs, reset}] =
        useLazyGetOperationQuery<OperationEditAttributes>();

    const open = async () => {
        try {
            await getOperation({
                id: YTApiId.operationEditData,
                parameters: {
                    operation_id: operationId,
                    attributes: [
                        ...OPERATION_EDIT_ATTRIBUTES,
                        ...(isCumulativeSpecPatchSupported ? ['cumulative_spec_patch'] : []),
                    ],
                },
            }).unwrap();
        } catch (error) {
            showErrorPopup(error as YTError);
        }
    };

    const specificationPatchSupported =
        originalArgs?.parameters.attributes?.includes('cumulative_spec_patch') ?? false;

    return {
        operationAttributes,
        specificationPatchSupported,
        isFetching,
        open,
        close: reset,
    };
}
