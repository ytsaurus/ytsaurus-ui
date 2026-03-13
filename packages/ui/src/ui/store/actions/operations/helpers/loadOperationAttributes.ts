import {TYPED_OUTPUT_FORMAT} from '../../../../constants';
import {JSONSerializer} from '../../../../common/yt-api';
import {isFinalState} from '../../../../pages/operations/OperationDetail/tabs/JobsTimeline/helpers/isFinalState';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import CancelHelper from '../../../../utils/cancel-helper';

const operationDetailsRequests = new CancelHelper();

export const loadOperationAttributes = async (id: string, isAlias: boolean) => {
    const {id: operationId, state} = await ytApiV3.getOperation({
        parameters: {
            ...(isAlias ? {operation_alias: id, include_runtime: true} : {operation_id: id}),
            attributes: ['id', 'state'],
        },
        cancellation: operationDetailsRequests.removeAllAndSave,
    });

    const includeScheduler = Boolean(state) && !isFinalState(state);

    return ytApiV3.getOperation({
        parameters: {
            operation_id: operationId,
            includeScheduler,
            output_format: TYPED_OUTPUT_FORMAT,
        },
        setup: {JSONSerializer},
        cancellation: operationDetailsRequests.removeAllAndSave,
    });
};
