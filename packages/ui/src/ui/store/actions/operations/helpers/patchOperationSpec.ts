import {YTApiId, ytApiV3Id} from '../../../../rum/rum-wrap-api';
import {type OperationSpecPatchItem} from '../../../../utils/operations/specification-patch';

export function patchOperationSpec(
    operationId: string,
    patches: OperationSpecPatchItem[],
): Promise<void> {
    return ytApiV3Id.patchOpSpec(YTApiId.operationPatchSpec, {
        operation_id: operationId,
        patches,
    });
}
